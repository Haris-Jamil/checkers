import { Cell } from "./Cell";
import { Piece } from "./Piece";
import { Player } from "./Player";

export class Board {
    
    player1: Player;
    player2: Player;
    cells: Cell[][] = [];
    selected: Piece = null;
    turn: Player;
    oppositePlayer: Player;

    constructor(p1, p2){
        this.player1 = p1;
        this.player2 = p2;
        this.turn = p1;
        this.oppositePlayer = p2;
        this.makeCells();
        this.makePieces();
        this.renderBoard();
        this.registerEventHandler();
    }

    makeCells() {
        for (let y = 0; y < 8; y++) {                    
            this.cells[y] = [];
            for (let x = 0; x < 8; x++) { 
                const cell = new Cell(y, x, null);
                this.cells[y].push(cell);
            }
        }
    }

    makePieces() {        
        for (let y = 0; y < 8; y++) {  
            for (let x = 0; x < 8; x++) {
                if ((x + y) % 2 !== 0) {                                   
                    if ([0, 1 , 2].includes(y)) {  
                        const piece = new Piece(y, x, this.player1);
                        this.cells[y][x].piece = piece;            
                    }
                    if ([5, 6 , 7].includes(y)) {
                        const piece = new Piece(y, x, this.player2);
                        this.cells[y][x].piece = piece;           
                    }
                }
            }
        }
    }

    renderBoard() {        
        const board = document.querySelector('.board')
        board.innerHTML = '';
        for (let y = 0; y < 8; y++) {
                        
            const row = document.createElement('div');
            row.classList.add('row');

            for (let x = 0; x < 8; x++) {    

                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('x', String(x));
                cell.setAttribute('y', String(y));
                if ((x + y) % 2 !== 0) {
                    cell.classList.add('black');
                }
                if (this.cells[y][x].piece) {
                    const piece = document.createElement('div');
                    piece.classList.add('piece');
                    if (this.cells[y][x].piece.player === this.player1) {
                        piece.classList.add('p1');
                    } else {
                        piece.classList.add('p2');
                    }      
                    piece.classList.add(this.cells[y][x].piece.isKing ? 'king' : 'normal');              
                    if (this.cells[y][x].piece === this.selected) {
                        cell.classList.add('selected');
                    }
                    cell.appendChild(piece);
                }
                row.appendChild(cell);
            }
            board?.appendChild(row);
        }
    }

    registerEventHandler() {
        document.body.addEventListener('click', (event) => {
            const target: any = event.target;
            if (target.className.includes('piece') || target.className.includes('cell')) {
                const cell = target.closest('div.cell');
                let x = Number(cell.getAttribute('x'));
                let y = Number(cell.getAttribute('y'));

                if (!this.selected) {                   
                    if (this.cells[y][x].piece) {
                        if (this.isOwnPiece(this.cells[y][x].piece)) {
                            this.selected = this.cells[y][x].piece;
                        }
                    }
                } else {
                    if (this.cells[y][x].piece?.player === this.turn) {
                        this.selected = this.cells[y][x].piece;
                        this.renderBoard();
                        return;
                    }
                    const normalMove: boolean = this.isValidNormalMove(this.cells[y][x]);
                    const killingMove: boolean =  this.isValidKillingMove(this.cells[y][x]);
                    if (this.cells[y][x].isEmpty() && ( normalMove || killingMove)) {                        
                        this.cells[this.selected.y][this.selected.x].piece = null;
                        this.selected.x = x;
                        this.selected.y = y;
                        this.cells[y][x].piece = this.selected;
                        if (this.turn === this.player1 && y === 7) {
                            this.cells[y][x].piece.isKing = true;
                        } else if (this.turn === this.player2 && y === 0) {
                            this.cells[y][x].piece.isKing = true;
                        }                        
                        if (!killingMove || !this.canKillMore(this.cells[y][x])) {
                            this.oppositePlayer = this.turn;
                            this.turn = this.getOppositePlayer();
                        }       
                        this.selected = null;                                    
                    }
                }                
                this.renderBoard();                
            }

        }, false);
    }

    canKillMore(cell: Cell): boolean {        
        const [currPlayer, oppPlayer] = [this.turn.name, this.oppositePlayer.name];
        try {
            if (cell.x === 0) {
                return this[currPlayer + 'CanKillOnRight'](cell) || (this.selected.isKing &&  this[oppPlayer + 'CanKillOnRight'](cell));
            } else if (cell.x === 7) {
                return this[currPlayer + 'CanKillOnLeft'](cell) || (this.selected.isKing &&  this[oppPlayer + 'CanKillOnLeft'](cell));
            } else {
                return (this[currPlayer + 'CanKillOnLeft'](cell) || this[currPlayer + 'CanKillOnRight'](cell)) || 
                    (this.selected.isKing && (this[oppPlayer + 'CanKillOnLeft'](cell) || this[oppPlayer + 'CanKillOnRight'](cell)));
            }        
        } catch (ex) {
            return false;
        }
    }

    p1CanKillOnRight(cell: Cell): boolean {
        return this.cells[cell.y + 1][cell.x + 1].piece?.player === this.oppositePlayer && this.cells[cell.y + 2][cell.x + 2].isEmpty(); 
    }

    p1CanKillOnLeft(cell: Cell): boolean {
        return this.cells[cell.y + 1][cell.x - 1].piece?.player === this.oppositePlayer && this.cells[cell.y + 2][cell.x - 2].isEmpty();
    }

    p2CanKillOnRight(cell: Cell): boolean {
        return this.cells[cell.y - 1][cell.x + 1].piece?.player === this.oppositePlayer && this.cells[cell.y - 2][cell.x + 2].isEmpty(); 
    }

    p2CanKillOnLeft(cell: Cell): boolean {
        return this.cells[cell.y - 1][cell.x - 1].piece?.player === this.oppositePlayer && this.cells[cell.y - 2][cell.x - 2].isEmpty(); 
    }

    

    isValidNormalMove(cellToMove: Cell): boolean {        
        const validHorizontalMovement = this.selected.x - 1 === cellToMove.x || this.selected.x + 1 === cellToMove.x;
        if ((this.turn === this.player1 || this.selected.isKing) && this.selected.y + 1 === cellToMove.y && validHorizontalMovement ) {
            return true;
        } 
        if ((this.turn === this.player2 || this.selected.isKing) && this.selected.y - 1 === cellToMove.y && validHorizontalMovement ) {
            return true;
        }       
        return false
    }

    isValidKillingMove(cellToMove: Cell): boolean {
        const otherPlayer: Player = this.getOppositePlayer();
        if ((this.turn === this.player1 || this.selected.isKing) && this.selected.y + 2 === cellToMove.y ) {
            if ( this.selected.x - 2 === cellToMove.x && this.cells[this.selected.y + 1][this.selected.x - 1].piece?.player === otherPlayer) {
                this.cells[this.selected.y + 1][this.selected.x - 1].piece = null;
                return true;
            }     
            if ( this.selected.x + 2 === cellToMove.x && this.cells[this.selected.y + 1][this.selected.x + 1].piece?.player === otherPlayer) {
                this.cells[this.selected.y + 1][this.selected.x + 1].piece = null;
                return true;
            }     
        } 

        if ((this.turn === this.player2 || this.selected.isKing) && this.selected.y - 2 === cellToMove.y ) {
            if ( this.selected.x - 2 === cellToMove.x && this.cells[this.selected.y - 1][this.selected.x - 1].piece?.player === otherPlayer) {
                this.cells[this.selected.y - 1][this.selected.x - 1].piece = null;
                return true;
            }     
            if ( this.selected.x + 2 === cellToMove.x && this.cells[this.selected.y - 1][this.selected.x + 1].piece?.player === otherPlayer) {
                this.cells[this.selected.y - 1][this.selected.x + 1].piece = null;
                return true;
            }     
        }             
        return false
    }

    isOwnPiece(piece: Piece): boolean {
        return this.turn === piece.player;           
    }   

    getOppositePlayer(): Player {
        return this.turn === this.player1 ? this.player2 : this.player1;
    }

}