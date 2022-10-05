import { AbstractResponseBuilder } from "../../core/http/abstract/response_builder.ts";
import { StatusCodeRegistry } from "../../core/http/status_code_registry.ts";

export class NativeResponseBuilder extends AbstractResponseBuilder<
  Response,
  BodyInit
> {
  build(): Response {
    if (this.current_state.upgrade) {
      return this.current_state.upgrade;
    }

    if (
      this.current_state.headers ||
      this.current_state.body ||
      this.current_state.status
    ) {
      const statusFields = {
        status: 200,
        statusText: StatusCodeRegistry.get(200)?.description,
      };

      if (this.current_state.status) {
        statusFields.status = this.current_state.status;
        statusFields.statusText =
          StatusCodeRegistry.get(this.current_state.status)?.description || "";
      }

      return new Response(this.current_state.body, {
        // @ts-ignore: TODO(crookse) Need to account for HeadersInit not in Node
        headers: this.current_state.headers ?? new Map<string, string>(), // new Headers(),
        ...statusFields,
      });
    }

    return new Response(this.current_state.body);
  }
}
