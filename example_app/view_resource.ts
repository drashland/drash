import Drash from "../mod.ts";

export default class ViewResource extends Drash.Http.Resource {
    static paths = ["/view"];

    public async GET() {
        const filename = '/index.html';
        const data = { name: "Drash" };
        const withData = this.request.getUrlQueryParam('data') === 'true'
        this.response.body = this.response.render(filename, withData ? data : null);
        return this.response;
    }
}