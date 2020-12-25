import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

const GAMES_QUERY = gql`
 {
   games {
    name,
    id,
    squares,
    winner,
    type
  }
}
`;

 const SUBSCRIPTION_QUERY = gql`
 subscription {
  gameChanged {
    id
    name
    winner
    squares
    type
  }
}`

const CreateQuery = gql`
  mutation Mutation($id: ID!, $winner: String!, $name: String!, $squares: String!, $type: String!, $update: Int!) {
    game(id: $id, winner: $winner, name: $name, squares: $squares, type: $type, update: $update) {
      id,
      name,
      winner,
      squares,
      type
    }
  }
`;

interface Game {
  id: number;
  name: string;
  winner: string;
  squares: string;
  type: string;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  xIsNext: boolean = true;
  modalVisible: boolean = false;
  listVisible: boolean = false;
  isSinglePlayer: boolean = false;
  multiplayerGames: Array<any> = []
  winner: string = '';
  xWinners: number = 0
  squaresX = []
  squaresO = []
  squares = ['', '', '', '', '', '', '', '', '']
  gamesList: Array<any> = []
  @ViewChild("one") oneSquare: ElementRef;
  @ViewChild("two") twoSquare: ElementRef;
  @ViewChild("three") threeSquare: ElementRef;
  @ViewChild("four") fourSquare: ElementRef;
  @ViewChild("five") fiveSquare: ElementRef;
  @ViewChild("six") sixSquare: ElementRef;
  @ViewChild("seven") sevenSquare: ElementRef;
  @ViewChild("eight") eightSquare: ElementRef;
  @ViewChild("nine") nineSquare: ElementRef;
  private query: QueryRef<any>;
  uri = 'http://localhost:4020/graphql';
  selectedGame: Game = {
    id: 0,
    name: '',
    winner: '',
    squares: '',
    type: ''
  }

  emptyGame: Game = {
    id: 0,
    name: '',
    winner: '',
    squares: '',
    type: ''
  }
  subscription;

  typeVisible: boolean = false;
  game: Game;

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.query = this.apollo.watchQuery({
      query: GAMES_QUERY
    });

    this.query.valueChanges.subscribe(result => {
      for (let i = 0; i < result.data.games.length; i++){
        const game = result.data.games[i]
        this.gamesList.push(game)
      }
    });

    this.apollo.subscribe({
      query: SUBSCRIPTION_QUERY
    }).subscribe(({ data }) => {
      let game: Game = {
        id: data['gameChanged']['id'],
        name: data['gameChanged']['name'],
        winner: data['gameChanged']['winner'],
        squares: data['gameChanged']['squares'],
        type: data['gameChanged']['type']
      }
      let gameExist = this.gamesList.filter((item) => item.id === game.id)
      if(gameExist.length == 0){
        this.gamesList.push(game)
      }else{
        this.gamesList.pop()
        this.gamesList.push(game)
      }
    });

  }

  get player() {
    return this.xIsNext ? 'X' : 'O';
  }

  openTypeGame() {
    this.typeVisible = true
  }

  closeTypeModal() {
    this.typeVisible = false
  }

  makeMove(el: HTMLElement) {
    if (this.winner == '') {
      if (el.innerHTML == '') {
        if (this.player == 'O' && !this.isSinglePlayer) {
          el.innerHTML = 'O'
          el.classList.remove('x-square')
          el.classList.add('o-square')
          this.squaresO.push(parseInt(el.id))
          this.xIsNext = true;
          this.squares[el.id] = 'O'
          this.calculateWinner()
        } else {
          el.innerHTML = 'X'
          el.classList.remove('o-square')
          el.classList.add('x-square')
          this.squaresX.push(parseInt(el.id))
          this.xIsNext = false;
          this.squares[el.id] = 'X'
          this.calculateWinner()
          if (this.isSinglePlayer&&this.winner=='') {
            let cellId = this.getRandomField()
            let cell = document.getElementById(cellId)
            cell.classList.add('o-square')
            cell.innerHTML = 'O'
            this.squares[cellId] = 'O'
            this.squaresO.push(cellId)
            this.calculateWinner()
          }
        }
        this.apollo.mutate({
          mutation: CreateQuery,
          variables: {
            id: this.selectedGame.id,
            winner: this.winner,
            name: 'game ' + this.selectedGame.id,
            squares: this.squares.toString(),
            type: this.selectedGame.type,
            update: 1
          }
        }).subscribe((response) => {
          // console.log(response)
        });
      }
    }
  }

  getRandomField() {
    let emptyCells = []
    for (let i = 0; i < this.squares.length; i++) {
      const element = this.squares[i]
      if (element == '') {
        emptyCells.push(i)
      }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  createNewGame(type) {
    if (this.selectedGame.id != 0) {
      this.reset()
      this.oneSquare.nativeElement.innerHTML = ''
      this.twoSquare.nativeElement.innerHTML = ''
      this.threeSquare.nativeElement.innerHTML = ''
      this.fourSquare.nativeElement.innerHTML = ''
      this.fiveSquare.nativeElement.innerHTML = ''
      this.sixSquare.nativeElement.innerHTML = ''
      this.sevenSquare.nativeElement.innerHTML = ''
      this.eightSquare.nativeElement.innerHTML = ''
      this.nineSquare.nativeElement.innerHTML = ''
      this.xIsNext = true
    }
    this.selectedGame.id = this.gamesList.length + 1;
    this.selectedGame.type = type
    this.typeVisible = false
    if (type == 'single player') {
      this.isSinglePlayer = true
    }
    if (type == 'multiplayer') {
      this.isSinglePlayer = false
    }
    this.apollo.mutate({
      mutation: CreateQuery,
      variables: {
        id: this.selectedGame.id,
        winner: '',
        name: 'game ' + this.selectedGame.id,
        squares: this.squares.toString(),
        type: type,
        update: 0
      }
    }).subscribe((response) => {
    });
  }

  closeModal() {
    this.modalVisible = false
  }

  closeListModal() {
    this.listVisible = false
  }

  openList() {
    this.listVisible = true
  }

  calculateWinner() {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (this.squaresX.includes(a) && this.squaresX.includes(b) && this.squaresX.includes(c)) {
        this.winner = 'X'
        this.modalVisible = true
      }
      if (this.squaresO.includes(a) && this.squaresO.includes(b) && this.squaresO.includes(c)) {
        this.winner = 'O'
        this.modalVisible = true
      }
      if(!this.squares.includes('')&&this.winner==''){
        this.winner = 'DRAW'
        this.modalVisible = true
        console.log(this.modalVisible)
      }
    }
    return null;
  }

  reset() {
    this.selectedGame.id = 0
    this.selectedGame.winner = ''
    this.selectedGame.name = ''
    this.selectedGame.type = ''
    this.selectedGame.squares = ''
    this.winner = '';
    this.squaresO = []
    this.squares = ['', '', '', '', '', '', '', '', '']
    this.squaresX = []
  }

  openGame(id) {
    this.listVisible = false
    for (let i = 0; i < this.gamesList.length; i++) {
      const element = this.gamesList[i]
      if (element.id === id) {
        this.reset()
        this.selectedGame.id = element.id
        this.selectedGame.winner = element.winner
        this.selectedGame.name = element.name
        this.selectedGame.type = element.type
        this.selectedGame.squares = element.squares
        this.squares = this.selectedGame.squares.split(',')
        if (this.selectedGame.winner != '') {
          this.winner = this.selectedGame.winner
        }
        setTimeout(() => {
          this.fillCells(this.squares)
        }, 200);
      }
    }
  }

  fillCells(array) {
    this.oneSquare.nativeElement.innerHTML = ''
    this.twoSquare.nativeElement.innerHTML = ''
    this.threeSquare.nativeElement.innerHTML = ''
    this.fourSquare.nativeElement.innerHTML = ''
    this.fiveSquare.nativeElement.innerHTML = ''
    this.sixSquare.nativeElement.innerHTML = ''
    this.sevenSquare.nativeElement.innerHTML = ''
    this.eightSquare.nativeElement.innerHTML = ''
    this.nineSquare.nativeElement.innerHTML = ''
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      if (element === 'X') {
        this.squaresX.push(i)
        let number: any = i
        let cell = document.getElementById(number)
        cell.classList.remove('o-square')
        cell.classList.add('x-square')
        cell.innerHTML = 'X'
      }
      if (element === 'O') {
        this.squaresO.push(i)
        let number: any = i
        let cell = document.getElementById(number)
        cell.classList.remove('x-square')
        cell.classList.add('o-square')
        cell.innerHTML = 'O'
      }
    }
    if (this.squaresX.length == this.squaresO.length) {
      this.xIsNext = true;
    } else {
      this.xIsNext = false;
    }
  }

}
