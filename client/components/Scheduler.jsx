import React, { Component } from 'react'

export default class Scheduler extends Component {
  constructor(){
    super()

    this.state={schedule:{}}
  }

  render() {

    return (
      <div >
        <br/><br/><br/>
        <div>Upload Video</div>
        <form ref='uploadForm'
          id='uploadForm'
          action='/api/src/upload'
          method='post'
          encType="multipart/form-data">
            <input type="file" name="sampleFile" />
            <input type='submit' value='Upload!' />
        </form>
        <br/><br/>
          My Videos:
          (if not recent try refreshing page)
          <div>Name Duration</div>
          {this.props.vids.map((vid)=>{
            console.log(vid)
            return (<div>{vid.src} - {vid.duration}</div>)
          })}

        <br/><br/><br/>
        <div>Add Video to Timeslot</div>
        <div>Video: <select id="src">
          {
            this.props.vids.map((vid)=>{
              return (<option value={`${vid.src}`}>{vid.src}</option>)
            })
          }
        </select></div>
        <div>Day:
          <select id="day">
            <option value="0">Sun</option>
            <option value="1">Mon</option>
            <option value="2">Tue</option>
            <option value="3">Wed</option>
            <option value="4">Thu</option>
            <option value="5">Fri</option>
            <option value="6">Sat</option>
          </select>
        </div>
        <div>Time: Hour: <select id="hr">
            <option value="0">12pm</option>
            <option value="1">1am</option>
            <option value="2">2am</option>
            <option value="3">3am</option>
            <option value="4">4am</option>
            <option value="5">5am</option>
            <option value="6">6am</option>
            <option value="7">7am</option>
            <option value="8">8am</option>
            <option value="9">9am</option>
            <option value="10">10am</option>
            <option value="11">11am</option>
            <option value="12">12pm</option>
            <option value="13">1pm</option>
            <option value="14">2pm</option>
            <option value="15">3pm</option>
            <option value="16">4pm</option>
            <option value="17">5pm</option>
            <option value="18">6pm</option>
            <option value="19">7pm</option>
            <option value="20">8pm</option>
            <option value="21">9pm</option>
            <option value="22">10pm</option>
            <option value="23">11pm</option>
        </select> Min:<select id="min">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
            <option value="21">21</option>
            <option value="22">22</option>
            <option value="23">23</option>
            <option value="24">24</option>
            <option value="25">25</option>
            <option value="26">26</option>
            <option value="27">27</option>
            <option value="28">28</option>
            <option value="29">29</option>
            <option value="30">30</option>
            <option value="31">31</option>
            <option value="32">32</option>
            <option value="33">33</option>
            <option value="34">34</option>
            <option value="35">35</option>
            <option value="36">36</option>
            <option value="37">37</option>
            <option value="38">38</option>
            <option value="39">39</option>
            <option value="40">40</option>
            <option value="41">41</option>
            <option value="42">42</option>
            <option value="43">43</option>
            <option value="44">44</option>
            <option value="45">45</option>
            <option value="46">46</option>
            <option value="47">47</option>
            <option value="48">48</option>
            <option value="49">49</option>
            <option value="50">50</option>
            <option value="51">51</option>
            <option value="52">52</option>
            <option value="53">53</option>
            <option value="54">54</option>
            <option value="55">55</option>
            <option value="56">56</option>
            <option value="57">57</option>
            <option value="58">58</option>
            <option value="59">59</option>
        </select></div>
        <button onClick={this.props.submitHandler}>submit</button>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
      </div>

    )
  }
}
