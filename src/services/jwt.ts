import * as nJwt from "njwt";
import { appConfig } from "../config.ts";

type JwtClaims = {
  sub: string;
};

export class JwtService {
  sign(claims: JwtClaims): string {
    const jwt = nJwt
      .create(claims, appConfig.secret)
      .setExpiration(Date.now() + 1000 * 60 * 15); // 15 minute;
    return jwt.compact();
  }

  verify(token: string): JwtClaims | null {
    try {
      const jwt = nJwt.verify(token, appConfig.secret);
      if (!jwt) throw new Error("Invalid token");
      return jwt.body.toJSON() as JwtClaims;
    } catch (e) {
      return null;
    }
  }
}
