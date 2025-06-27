import { z } from "zod";

const schema = z.object({
    name: z.string().min(1),
    password: z.string().min(1),
});

type Schema = z.infer<typeof schema>;

export { schema, type Schema };
