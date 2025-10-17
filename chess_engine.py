# chess_engine.py — Motor propio minimalista (sin dependencias)
# Reglas v1: movimiento estándar, jaque/jaque mate, tablas por ahogado, promoción a Dama.
# Pendiente (fácil de añadir en v2): en passant, enroque, subpromociones.

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Tuple, Optional
import random

# Representación: matriz 8x8 con piezas en unicode para impresión bonita.
# Internamente usamos letras: blancas en mayúsculas, negras en minúsculas: P N B R Q K / p n b r q k
# Tablero: fila 0 = 8ª (arriba), fila 7 = 1ª (abajo); col 0 = 'a', col 7 = 'h'

PIECE_VALUES = {
    'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 0,
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0,
}

UNICODE_PIECES = {
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚',
}

OFFSETS_KNIGHT = [(-2,-1), (-2,1), (-1,-2), (-1,2), (1,-2), (1,2), (2,-1), (2,1)]
OFFSETS_BISHOP = [(-1,-1), (-1,1), (1,-1), (1,1)]
OFFSETS_ROOK   = [(-1,0), (1,0), (0,-1), (0,1)]
OFFSETS_QUEEN  = OFFSETS_BISHOP + OFFSETS_ROOK
OFFSETS_KING   = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]

@dataclass
class Move:
    fr: Tuple[int,int]
    to: Tuple[int,int]
    promo: Optional[str] = None  # 'Q'|'R'|'B'|'N' (v1: solo 'Q')

class ChessGame:
    def __init__(self) -> None:
        self.board = self._initial_board()
        self.white_to_move = True
        self.halfmove_clock = 0  # para tablas 50-mov (no se usa en v1)
        self.fullmove_number = 1
        self.history: List[Tuple] = []

    def _initial_board(self) -> List[List[str]]:
        # FEN inicial: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
        b = [[' ']*8 for _ in range(8)]
        back = list('rnbqkbnr')
        b[0] = back[:]            # 8ª negra
        b[1] = list('pppppppp')   # 7ª negra
        b[6] = list('PPPPPPPP')   # 2ª blanca
        b[7] = list('RNBQKBNR')   # 1ª blanca
        return b

    # ---------- utilidades ----------
    def _in_bounds(self, r:int, c:int) -> bool:
        return 0 <= r < 8 and 0 <= c < 8

    def _color_of(self, p:str) -> Optional[str]:
        if p == ' ': return None
        return 'w' if p.isupper() else 'b'

    def _king_pos(self, white:bool) -> Tuple[int,int]:
        target = 'K' if white else 'k'
        for r in range(8):
            for c in range(8):
                if self.board[r][c] == target:
                    return (r,c)
        raise RuntimeError('Rey no encontrado')

    def _is_attacked(self, r:int, c:int, by_white:bool) -> bool:
        # Comprueba si (r,c) está atacado por color by_white
        for rr in range(8):
            for cc in range(8):
                p = self.board[rr][cc]
                if p == ' ': continue
                if by_white != p.isupper():
                    continue
                for mv in self._piece_moves(rr, cc, pseudo=True):
                    if mv.to == (r,c):
                        return True
        return False

    def _is_in_check(self, white:bool) -> bool:
        kr, kc = self._king_pos(white)
        return self._is_attacked(kr, kc, by_white=not white)

    # ---------- generación de movimientos ----------
    def _piece_moves(self, r:int, c:int, pseudo:bool=False) -> List[Move]:
        # pseudo=True => no filtra jaque propio; se usa en _is_attacked y filtrado
        p = self.board[r][c]
        if p == ' ': return []
        white = p.isupper()
        moves: List[Move] = []
        if p in 'Pp':
            dir = -1 if white else 1  # porque fila 0 es arriba
            start_row = 6 if white else 1
            # avance 1
            r1, c1 = r+dir, c
            if self._in_bounds(r1,c1) and self.board[r1][c1] == ' ':
                moves.append(self._maybe_promo(Move((r,c),(r1,c1)), white, r1))
                # avance 2 desde inicial
                r2 = r+2*dir
                if r == start_row and self.board[r2][c] == ' ':
                    moves.append(Move((r,c),(r2,c)))
            # capturas
            for dc in (-1, 1):
                rr, cc = r+dir, c+dc
                if self._in_bounds(rr,cc):
                    tgt = self.board[rr][cc]
                    if tgt != ' ' and self._color_of(tgt) != self._color_of(p):
                        moves.append(self._maybe_promo(Move((r,c),(rr,cc)), white, rr))
            # (en passant omitido en v1)
        elif p in 'Nn':
            for dr,dc in OFFSETS_KNIGHT:
                rr,cc = r+dr, c+dc
                if not self._in_bounds(rr,cc): continue
                tgt = self.board[rr][cc]
                if tgt == ' ' or self._color_of(tgt) != self._color_of(p):
                    moves.append(Move((r,c),(rr,cc)))
        elif p in 'BbRrQq':
            dirs = OFFSETS_BISHOP if p in 'Bb' else OFFSETS_ROOK if p in 'Rr' else OFFSETS_QUEEN
            for dr,dc in dirs:
                rr,cc = r+dr, c+dc
                while self._in_bounds(rr,cc):
                    tgt = self.board[rr][cc]
                    if tgt == ' ':
                        moves.append(Move((r,c),(rr,cc)))
                    else:
                        if self._color_of(tgt) != self._color_of(p):
                            moves.append(Move((r,c),(rr,cc)))
                        break
                    rr += dr; cc += dc
        elif p in 'Kk':
            for dr,dc in OFFSETS_KING:
                rr,cc = r+dr, c+dc
                if not self._in_bounds(rr,cc): continue
                tgt = self.board[rr][cc]
                if tgt == ' ' or self._color_of(tgt) != self._color_of(p):
                    moves.append(Move((r,c),(rr,cc)))
            # (enroque omitido en v1)
        else:
            return []

        if pseudo:
            return moves
        # filtrar movimientos que dejan a tu rey en jaque
        legal: List[Move] = []
        for mv in moves:
            self._push(mv)
            if not self._is_in_check(white):
                legal.append(mv)
            self._pop()
        return legal

    def _maybe_promo(self, mv:Move, white:bool, dst_row:int) -> Move:
        if (white and dst_row == 0) or ((not white) and dst_row == 7):
            return Move(mv.fr, mv.to, promo='Q')
        return mv

    def _push(self, mv:Move) -> None:
        # Guarda estado mínimo para deshacer
        (r1,c1) = mv.fr; (r2,c2) = mv.to
        p = self.board[r1][c1]
        cap = self.board[r2][c2]
        self.history.append((r1,c1,r2,c2,p,cap,self.white_to_move))
        # mover
        self.board[r2][c2] = p
        self.board[r1][c1] = ' '
        # promoción
        if mv.promo:
            self.board[r2][c2] = 'Q' if p.isupper() else 'q'
        # lado al mover
        self.white_to_move = not self.white_to_move

    def _pop(self) -> None:
        r1,c1,r2,c2,p,cap,wtm = self.history.pop()
        self.board[r1][c1] = p
        self.board[r2][c2] = cap
        self.white_to_move = wtm

    # ---------- API pública del juego ----------
    def legal_moves(self) -> List[Move]:
        legal: List[Move] = []
        white = self.white_to_move
        for r in range(8):
            for c in range(8):
                p = self.board[r][c]
                if p == ' ': continue
                if (p.isupper() and white) or (p.islower() and not white):
                    legal.extend(self._piece_moves(r,c))
        return legal

    def move_from_str(self, s:str) -> Optional[Move]:
        # formato: e2e4 o e7e8q/Q
        s = s.strip().lower()
        if len(s) < 4: return None
        ffile, frank, tfile, trank = s[0], s[1], s[2], s[3]
        if ffile not in 'abcdefgh' or tfile not in 'abcdefgh':
            return None
        if frank not in '12345678' or trank not in '12345678':
            return None
        fr = (8 - int(frank), ord(ffile)-97)
        to = (8 - int(trank), ord(tfile)-97)
        promo = None
        if len(s) >= 5 and s[4] in 'qrbn':
            promo = s[4].upper() if self.white_to_move else s[4]
        mv = Move(fr,to,promo)
        # debe existir en legales
        for lm in self.legal_moves():
            if lm.fr == mv.fr and lm.to == mv.to:
                # forzamos promo a dama en v1 si procede
                if lm.promo:
                    lm.promo = 'Q'
                return lm
        return None

    def apply(self, mv:Move) -> None:
        self._push(mv)
        # contadores básicos
        if not self.white_to_move:
            self.fullmove_number += 1

    def status(self) -> Tuple[bool,bool]:
        # (game_over, white_won?) si termina por mate; tablas si sin jugadas y no en jaque
        legal = self.legal_moves()
        if legal:
            return (False, False)
        # sin movimientos
        side_white = self.white_to_move
        if self._is_in_check(side_white):
            # mate
            return (True, not side_white)  # si le toca a blancas y están en jaque sin jugadas -> negras ganan
        else:
            # tablas por ahogado
            return (True, False)

    def engine_move(self) -> Optional[Move]:
        # Estrategia sencilla: prioriza capturas favorables; si no, elige un movimiento razonable al azar.
        legal = self.legal_moves()
        if not legal: return None
        # puntuamos capturas: valor(capturado) - 0.9*valor(agresor)
        scored = []
        for mv in legal:
            (r1,c1) = mv.fr; (r2,c2) = mv.to
            me = self.board[r1][c1]
            tgt = self.board[r2][c2]
            score = 0
            if tgt != ' ':
                score = PIECE_VALUES[tgt] - int(0.9 * PIECE_VALUES[me])
            scored.append((score, mv))
        scored.sort(key=lambda x: x[0], reverse=True)
        best_score = scored[0][0]
        bests = [mv for sc, mv in scored if sc == best_score]
        return random.choice(bests)

    # ---------- render ----------
    def board_html(self) -> str:
        # Render retro: usa clases y variables CSS de tu tema (sin inline colors fijas)
        out = ["<div class='chess-board'>"]
        # cabecera columnas
        out.append("<div class='chess-head'>  a  b  c  d  e  f  g  h</div>")
        for r in range(8):
            out.append("<div class='chess-row'>")
            # etiqueta de fila
            out.append(f"<span class='rank'>{8-r}</span>")
            for c in range(8):
                cls = 'sq-dark' if (r+c) % 2 else 'sq-light'
                p = self.board[r][c]
                glyph = UNICODE_PIECES.get(p, ' ')
                piece_cls = 'pw' if p.isupper() else 'pb'
                cell = f"<span class='sq {cls} {piece_cls}'>{glyph if glyph!=' ' else '·'}</span>"
                out.append(cell)
            out.append(f"<span class='rank'>{8-r}</span>")
            out.append("</div>")
        out.append("<div class='chess-foot'>  a  b  c  d  e  f  g  h</div>")
        out.append("</div>")
        turn = 'Blancas' if self.white_to_move else 'Negras'
        out.append(f"<div class='chess-turn'>Turno: <b>{turn}</b></div>")
        return ''.join(out)

