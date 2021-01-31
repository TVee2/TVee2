import React, {Component} from 'react'

export default class Tutorial extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      <div style={{margin:"30px"}}>
        <p><br/>
          <h3>TVee2 is a curation based, youtube broadcaster service that combines the simple format of normal tv and the ease of accessibility of youtube.</h3>
<br/><br/>
          If you click on the tv with fuzz in the navbar, it will bring you to that channels currently playing content. If logged in, here you can comment and make and post pixel images.  From the video control bar you can mute, fullscreen, flick the channel, keypad in a channel id and favorite a channel for easier access in the future.
<br/><br/>
          When a channel is created the youtube playlist or youtube channel’s content will be looped through and used as broadcasting content.
<br/><br/>
          If a channel is used, only the most recent ~4 hours of content willl be used for the channel.  This will be updated nightly, so if the channel uploads more videos, the channel will update as well daily.
<br/><br/>
          If a playlist is used, the entire playlist will be uploaded and all playlist items will be featured on channel.
<br/><br/><br/>
          Creating a channel:<br/>
          <ol>
            <li>This ability is only available for those logged in.  First, one must have a youtube playlist or youtube channel in mind to make a broadcast of.</li>
            <li>To upload either, you need the relevant youtube specific id for that item.  These items can be obtained from the relevant content on youtube</li>
            <ul>
              <li>For playlists, typically you can just get this from the url when playling or viewing a playlist on youtube.</li>
              <li>The playlist id is the characters after the ‘list=’ in the following typical youtube url – https://www.youtube.com/watch?v=RLykA1VN2NY&list=PLFs4vir_WsTwEd-nJgVJCZPNL2HALHApF.</li>
              <li>Here our playlist id is PLFs4vir_WsTwEd-nJgVJCZPNL3HALHHpF.  A channel id is similar , a typical url will look like https://www.youtube.com/channel/UCABX6ViZmPsWiYSFAyS0a3Q and the id will be the part following the ‘channel/’.</li>
              <li>It’s important to watch out for the alias that is often times used in place of the channel id, using the alias will result in an error and not seed the desired channel.</li>
            </ul>
            <li>Click on the hamburger menu in the nav and select channels</li>
            <li>Enter a 7 letter or fewer channel name</li>
            <li>One can customize their channel by adding optional fields such as:
              <ul>
                <li>Placeholder video that plays for 5 seconds in between content, to add one should use the youtube video id of that video. (watch?v=XXXXXXXX for example)</li>
                <li>Channel name less than 7 characters</li>
                <li>Related tags to associate with related channels</li>
                <li>Description -  to describe or say anything</li>
              </ul>
            </li>
            <li>Click on the youtube playlist id or channel id nav button and enter the id obtained from above</li>
            <li>Press submit - a message should appear that says working then message should disappear.  if this happens, then you have successfully made a broadcast youtube channel</li>
            <li>If an error occurs - follow insturctions or if nonspecific error, we may have a few bugs to work through on the backend and better messaging or fixes should come in the future.  It may be good to follow tips below and error may resolve itself.</li>
          </ol>
<br/><br/>
          Tips to remember:  
<br/><br/>
          Any video less than 25 seconds will not be featured on channel.<br/>
          Make sure any playlist or channel is set to public, it’s items are videos, and that videos are accessible in the desired region<br/>
        </p>
        <p>Please contact admin@tvee2.com with any questions or concerns.</p>
        <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      </div>
    )
  }
}
