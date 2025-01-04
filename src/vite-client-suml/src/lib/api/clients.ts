import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./v1";

const fetchClient = createFetchClient<paths>({
    baseUrl: "",
});

const $api = createClient(fetchClient);

export { $api };