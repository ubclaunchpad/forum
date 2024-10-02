import express, {Express, Request, Response} from 'express';
const port = process.env.PORT || 3000;

const app: Express = express();
app.use(express.json());


app.get("/api/v1/solution", (req: Request, res: Response) => {
    res.send("Working");
});

app.listen(port, () => {
    console.log(`running on port ${port}`);
});