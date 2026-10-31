import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { router } from "./routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: Error & { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const status = err.status ?? 500;
    if (status >= 500) console.error(err);
    res
      .status(status)
      .json({ error: status < 500 ? err.message : "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`Micro Journal API listening on http://localhost:${PORT}`);
});
