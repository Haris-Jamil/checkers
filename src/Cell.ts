import { Piece } from "./Piece";

export class Cell {
    x: number;
    y: number;
    piece: Piece | null;

    constructor(y, x, piece) {
        this.x = x;
        this.y = y;
        this.piece = piece;
    }

    isEmpty(): boolean {
        return !this.piece;
    }
}