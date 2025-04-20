import * as nJwt from "njwt";
import { appConfig } from "../config";

type JwtCLaims = {
  sub: string;
};

export class JwtService {
  constructor() {}

  sign(claims: JwtCLaims): string {
    const jwt = nJwt
      .create(claims, appConfig.secret)
      .setExpiration(Date.now() + 1000 * 60 * 15); // 15 minute;
    return jwt.compact();
  }

  verify(token: string): JwtCLaims | null {
    try {
      const jwt = nJwt.verify(token, appConfig.secret);
      if (!jwt) throw new Error("Invalid token");
      return jwt.body.toJSON() as JwtCLaims;
    } catch (e) {
      return null;
    }
  }
}
