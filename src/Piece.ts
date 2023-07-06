import { Player } from "./Player";

export class Piece {
    x: number;
    y: number;
    isKing: boolean;
    player: Player;

    constructor (y, x, p) {
        this.x = x;
        this.y = y;
        this.player = p;
        this.isKing = false;
    }

}