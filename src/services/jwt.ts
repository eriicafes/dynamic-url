import type { Box } from "getbox";
import njwt from "njwt";
import { appConfig, type AppConfig } from "../config.ts";

type JwtClaims = {
  sub: string;
};

export class JwtService {
  constructor(private appConfig: AppConfig) {}

  static init(box: Box) {
    return new JwtService(box.get(appConfig));
  }

  sign(claims: JwtClaims): string {
    const jwt = njwt
      .create(claims, this.appConfig.SECRET)
      .setExpiration(Date.now() + 1000 * 60 * 60); // 1 hour;
    return jwt.compact();
  }

  verify(token: string): JwtClaims | null {
    try {
      const jwt = njwt.verify(token, this.appConfig.SECRET);
      if (!jwt) throw new Error("Invalid token");
      return jwt.body.toJSON() as JwtClaims;
    } catch (e) {
      return null;
    }
  }
}
