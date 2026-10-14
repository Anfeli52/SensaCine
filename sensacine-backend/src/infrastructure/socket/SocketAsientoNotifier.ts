import { IAsientoNotifier } from "../../modules/reservas/asiento.types";
import { IBloqueoNotifier } from "../../modules/reservas/bloqueo.types";
import { getIO, roomFuncion } from "./socket";

export class SocketAsientoNotifier implements IAsientoNotifier, IBloqueoNotifier {
  asientosOcupados(idFuncion: number, idsAsiento: number[]): void {
    getIO().to(roomFuncion(idFuncion)).emit("asientos:ocupados", { idFuncion, idsAsiento });
  }

  // Asientos retenidos temporalmente por `idUsuario`; el resto de clientes los muestra como "Pendiente"
  asientosPendientes(idFuncion: number, idsAsiento: number[], idUsuario: number): void {
    getIO().to(roomFuncion(idFuncion)).emit("asientos:pendientes", { idFuncion, idsAsiento, idUsuario });
  }

  asientosLiberados(idFuncion: number, idsAsiento: number[]): void {
    getIO().to(roomFuncion(idFuncion)).emit("asientos:liberados", { idFuncion, idsAsiento });
  }
}
