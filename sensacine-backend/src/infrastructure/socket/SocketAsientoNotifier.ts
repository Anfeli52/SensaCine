import { IAsientoNotifier } from "../../modules/reservas/asiento.types";
import { getIO, roomFuncion } from "./socket";

export class SocketAsientoNotifier implements IAsientoNotifier {
  asientosOcupados(idFuncion: number, idsAsiento: number[]): void {
    getIO().to(roomFuncion(idFuncion)).emit("asientos:ocupados", { idFuncion, idsAsiento });
  }

  asientosLiberados(idFuncion: number, idsAsiento: number[]): void {
    getIO().to(roomFuncion(idFuncion)).emit("asientos:liberados", { idFuncion, idsAsiento });
  }
}
