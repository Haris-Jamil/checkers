import { Board } from "./Board";
import { Player } from "./Player";

export class Game {
    
    constructor() {
        this.init();
    }

    init() {
        const player1 = new Player('p1');
        const player2 = new Player('p2');
        new Board(player1, player2);
    }
}

new Game();