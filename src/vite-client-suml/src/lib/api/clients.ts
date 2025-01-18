import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./v1";

const apiClient = createFetchClient<paths>({
    baseUrl: "",
});

const $api = createClient(apiClient);

export { $api, apiClient };