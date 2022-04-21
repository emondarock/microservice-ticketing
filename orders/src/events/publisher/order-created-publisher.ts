import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from "@emon-workstation/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
