const { catchGrpc } = require("../utils/catchGrpc");
const AppError = require("../utils/appError");
const prisma = require("../database/prisma");
const { publishEmailUpdated } = require("../rabbitmq/producer");

const CreateBill = catchGrpc(async (call, callback) => {
  const { userId, amount, status, requestorRole } = call.request;
  if (requestorRole !== "Administrador") {
    throw new AppError("Permission denied", 403);
  }
  if (!userId || !amount || !status) {
    throw new AppError("The user id, amount and status are required", 400);
  }
  if (status !== "Pendiente" && status !== "Pagado" && status !== "Vencido") {
    throw new AppError("Invalid bill status", 400);
  }
  if (!Number.isInteger(amount)) {
    throw new AppError("Amount must be an integer", 400);
  }
  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const bill = await prisma.bill.create({
    data: {
      status,
      amount,
      userId,
    },
  });
  callback(null, {
    status: 201,
    data: {
      id: bill.id,
      status: bill.status,
      amount: bill.amount,
      userId: bill.userId,
      emissionDate: bill.createdAt,
    },
  });
});

const GetBill = catchGrpc(async (call, callback) => {
  const { id, requestorId, requestorRole } = call.request;
  if (!id) {
    throw new AppError("Bill ID is required", 400);
  }
  const bill = await prisma.bill.findUnique({
    where: { id },
  });
  if (bill.userId !== requestorId && requestorRole !== "Administrador") {
    throw new AppError("Permission denied", 403);
  }
  if (!bill || bill.deletedAt) {
    throw new AppError("Bill not found", 404);
  }
  callback(null, { 
    status: 200,
    bill: {
      id: bill.id,
      status: bill.status,
      amount: bill.amount,
      userId: bill.userId,
      emissionDate: bill.createdAt,
      paymentDate: bill.updatedAt ? bill.updatedAt : "Not paid",
    },
  });
});

const UpdateBill = catchGrpc(async (call, callback) => {
  const { id, status, requestorRole } = call.request;
  if (requestorRole !== "Administrador") {
    throw new AppError("Permission denied", 403);
  }
  if (!id || !status) {
    throw new AppError("Bill ID and status are required", 400);
  }
  if (status !== "Pendiente" && status !== "Pagado" && status !== "Vencido") {
    throw new AppError("Invalid bill status", 400);
  }
  const bill = await prisma.bill.findUnique({
    where: { id },
  });
  if (!bill || bill.deletedAt) {
    throw new AppError("Bill not found", 404);
  }
  let updatedBill;
  if (status === "Pagado") {
    updatedBill = await prisma.bill.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  } else {
    updatedBill = await prisma.bill.update({
      where: { id },
      data: { status, updatedAt: null },
    });
  }
  const user = await prisma.user.findUnique({
    where: { id: updatedBill.userId },
    select: { email: true },
  });
  await publishEmailUpdated({
    userEmail: user.email,
    bill: {
      id: updatedBill.id,
      status: updatedBill.status,
      amount: updatedBill.amount,
    },
  });
  callback(null, {
    status: 200,
    bill: {
      id: updatedBill.id,
      status: updatedBill.status,
      amount: updatedBill.amount,
      userId: updatedBill.userId,
      emissionDate: updatedBill.createdAt,
      paymentDate: updatedBill.updatedAt ? updatedBill.updatedAt : "Not paid",
    },
  });
});

const DeleteBill = catchGrpc(async (call, callback) => {
  const { id, requestorRole } = call.request;
  if (requestorRole !== "Administrador") {
    throw new AppError("Permission denied", 403);
  }
  if (!id) {
    throw new AppError("Bill ID is required", 400);
  }
  const bill = await prisma.bill.findUnique({
    where: { id },
  });
  if (!bill || bill.deletedAt) {
    throw new AppError("Bill not found", 404);
  }
  if (bill.status === "Pagado") {
    throw new AppError("Cannot delete a paid bill", 400);
  }
  await prisma.bill.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  callback(null, { status: 204 });
});

const ListBills = catchGrpc(async (call, callback) => {
  const { status, requestorId, requestorRole } = call.request;
  let bills;
  if (requestorRole !== "Administrador") {
    bills = await prisma.bill.findMany({
      where: {
        userId: requestorId,
        status: status || undefined,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  bills = await prisma.bill.findMany({
    where: {
      status: status || undefined,
      deletedAt: null,
    },
    orderBy: [{ createdAt: "desc" }, { userId: "asc" }],
  });

  bills = bills.map((bill) => ({
    id: bill.id,
    status: bill.status,
    amount: bill.amount,
    userId: bill.userId,
    emissionDate: bill.createdAt,
    paymentDate: bill.updatedAt ? bill.updatedAt : "Not paid",
  }));

  callback(null, { status: 200, data: bills });
});

module.exports = {
  CreateBill,
  GetBill,
  UpdateBill,
  DeleteBill,
  ListBills,
};
