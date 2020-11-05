import React, {Component} from 'react'

export default class Calendar extends Component {
  constructor() {
    super()

    this.state = {}
  }

  render() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td />
              <td>Sun</td>
              <td>Mon</td>
              <td>Tue</td>
              <td>Wed</td>
              <td>Thu</td>
              <td>Fri</td>
              <td>Sat</td>
            </tr>
            {[...Array(96)].map((x, i) => {
              var num = i * 96
              return (
                <tr key={`t${i}`} id={`t${i}`}>
                  {[...Array(8)].map((y, j) => {
                    if (j === 0) {
                      return (
                        <td
                          style={{height: '16px', width: '50px'}}
                        >{`${Math.floor(i / 4)}:${(i % 4) * 15}`}</td>
                      )
                    } else {
                      return (
                        <td
                          style={{
                            border: 'solid',
                            borderWidth: '1px',
                            borderColor: 'black',
                            height: '16px',
                            width: '50px'
                          }}
                          data-status={`s${i}t${j}`}
                          className={`s${i}t${j}`}
                          key={`s${i}t${j}`}
                          id={`s${i}t${j}`}
                        >
                          {`${
                            this.props.schedule[
                              `td${j - 1}h${Math.floor(i / 4)}m${(i % 4) * 15}`
                            ]
                              ? this.props.schedule[
                                  `td${j - 1}h${Math.floor(i / 4)}m${(i % 4) *
                                    15}`
                                ].src
                              : ''
                          }`}
                        </td>
                      )
                    }
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
