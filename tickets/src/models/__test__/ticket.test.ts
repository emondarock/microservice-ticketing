import { Ticket } from "../tickets";

it("implements optimistic concurrency control", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "12345",
  });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance?.set({ price: 15 });
  secondInstance?.set({ price: 25 });

  await firstInstance?.save();

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }
  throw new Error("Should not reach the point");
});

it("increment the version number on multiple save", async () => {
  const ticket = Ticket.build({
    title: "Concert",
    price: 20,
    userId: "12345",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
