import { Hono } from "hono";
import { getSignedDFileUrl } from "../utils/s3/getSignedFileUrl";
const user = new Hono();

user.get("/signedurl", async (c) => {
  const userId = 1;
  try {
    const fileType = c.req.query('filetype') || 'jpg';
    const url = await getSignedDFileUrl({
      fileName: `${userId}/${Math.random()}/${Date.now()}.${fileType}`,
      expiresIn: 60 * 10,
    });
    return c.json({url}, 200);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default user;
