import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const usuario = await this.authService.register(req.body);
    res.status(201).json(usuario);
  };
}
