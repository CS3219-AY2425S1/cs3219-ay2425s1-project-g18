import { verify } from 'jsonwebtoken'

const authenticateToken = (req: any, res: any, next: any) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Authorisation token required" });
    }

    const token = authorization.split(" ")[1];

    if (token) {
        verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
            if (err) {
                return res.status(403).json("Token is not valid");
            }

            req.user = user;
            next();
        });
    } else {
        return res.status(403).json({ error: "No token provided" });
    }
};

export { authenticateToken };