import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@emon-workstation/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
