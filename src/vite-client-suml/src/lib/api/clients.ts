import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./v1";

const fetchClient = createFetchClient<paths>({
    baseUrl: "http://localhost:2137/",
});

const $api = createClient(fetchClient);

export { $api };