import React, { Component } from 'react';
import { connect } from 'react-redux';
import SVG from 'react-inlinesvg';

import { MODE } from '../../utils/constants';
import {
  setMode, startRecording, stopRecording, showMenu,
} from '../../statemanagement/app/AppStateManagement';
import BtnRecording from '../shared/BtnRecording';

class UIControls extends Component {
  constructor(props) {
    super(props);
    this.audioContext = null;
    this.oscillatorNode = null;
    this.stopTime = 0;
  }

  // handleStartRecording() {
  //   this.props.dispatch(startCounting());
  // }


  beep (frequency, durationSec, ramp=false)
  {
      if (this.oscillatorNode == null) {
          this.audioContext = new (window.this.AudioContext || window.webkitAudioContext) ();
          this.stopTime = this.audioContext.currentTime;

          this.oscillatorNode = this.audioContext.createOscillator();
          this.oscillatorNode.type = "sine";
          this.oscillatorNode.connect (this.audioContext.destination);
          if (ramp) {
              this.oscillatorNode.frequency.setValueAtTime (frequency, this.stopTime);
          }
          this.oscillatorNode.start ();
          this.oscillatorNode.onended = function() {
              this.oscillatorNode = null;
              this.audioContext = null;
          }
      }

      if (ramp) {
          this.oscillatorNode.frequency.linearRampToValueAtTime (frequency, this.stopTime); // value in hertz
      } else {
          this.oscillatorNode.frequency.setValueAtTime (frequency, this.stopTime);  // value in hertz
      }

      this.stopTime += durationSec;
      this.oscillatorNode.stop (this.stopTime);
  }

  render() {
    if (this.props.recordingStatus.isRecording) {
      const diff = Math.abs(new Date(this.props.recordingStatus.dateStarted) - new Date());
      var seconds = Math.floor(diff / 1000) % 60;
      var minutes = Math.floor((diff / 1000) / 60);
      var avg_time = new Date(this.props.recordingStatus.avg_time).toISOString().slice(11,-1);
    }

    if (this.props.uiSettings.get('droneEnabled')){
      beep (250, 0.5);
      beep (1000, 0.2);
      beep (550, 0.5);
    }

    return (
      <>
        <div className="nav">
          {this.props.recordingStatus.isRecording
            && <div className="recording-bar" />}
          <div className="recording-status">
            {this.props.recordingStatus.isRecording
              && (
              <div className="time text-lg mb-1 font-bold">
                {minutes.toString().padStart(2, '0')}
                :
                {seconds.toString().padStart(2, '0')}
              </div>
              )}
            <div className="fps">
              {this.props.recordingStatus.currentFPS}
              {' '}
              FPS
            </div>
            {this.props.recordingStatus.isRecording && this.props.uiSettings.get('waitTimeEnabled') && 
            	<div className="fps avg_time">{avg_time.toString()} Wait Time</div>
			      }
          </div>
          <div className="flex">

            <div className="nav-left mt-2 ml-2 shadow flex">
              <button
                className={`btn btn-default rounded-l ${this.props.mode === MODE.LIVEVIEW ? 'btn-default--active' : ''} ${!this.props.uiSettings.get('pathfinderEnabled') && !this.props.uiSettings.get('counterEnabled') ? 'rounded-r' : ''}`}
                onClick={() => this.props.dispatch(setMode(MODE.LIVEVIEW))}
              >
                Live view
              </button>
              {this.props.uiSettings.get('counterEnabled')
              && (!this.props.recordingStatus.isRecording || this.props.isAtLeastOneCountingAreasDefined)
                && (
                <button
                  className={`btn btn-default border-r border-l border-default-soft border-solid ${this.props.mode === MODE.COUNTERVIEW ? 'btn-default--active' : ''} ${this.props.uiSettings.get('pathfinderEnabled') ? '' : 'rounded-r'}`}
                  onClick={() => this.props.dispatch(setMode(MODE.COUNTERVIEW))}
                >
                  Counter
                </button>
                )}
              {this.props.uiSettings.get('pathfinderEnabled')
                && (
                <button
                  className={`btn btn-default rounded-r ${this.props.mode === MODE.PATHVIEW ? 'btn-default--active' : ''}`}
                  onClick={() => this.props.dispatch(setMode(MODE.PATHVIEW))}
                >
                  Pathfinder
                </button>
                )}
            </div>
            <div className="nav-right mt-2 mr-2 flex">
              <button
                className={`btn btn-default shadow rounded-l ${this.props.mode === MODE.DATAVIEW ? 'btn-default--active' : ''}`}
                onClick={() => this.props.dispatch(setMode(MODE.DATAVIEW))}
              >
                Data
              </button>
              <button
                className={`btn btn-default shadow rounded-r border-l border-default-soft border-solid ${this.props.mode === MODE.CONSOLEVIEW ? 'btn-default--active' : ''}`}
                onClick={() => this.props.dispatch(setMode(MODE.CONSOLEVIEW))}
              >
                Console
              </button>
              <button
                className="btn btn-default shadow ml-2 py-0 px-3 rounded border border-default-soft border-solid"
                onClick={() => this.props.dispatch(showMenu())}
              >
                <SVG
                  className="w-5 h-5 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/menu.svg"
                  aria-label="icon menu"
                />
              </button>
            </div>
          </div>
        </div>
        <style jsx>
          {`
          .nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 3;
          }

          .nav-right {
            position: absolute;
            right: 0;
          }

          .recording-bar {
            background-color: #FF0000;
            text-align: center;
            width: 100%;
            z-index: 3;
            height: 0.32rem;
          }

          .recording-status {
            position: absolute;
            transform: translateX(-50%);
            margin-left: 50%;
            text-align: center;
            color: #FF0000;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            top: 1rem;
          }

          .avg_time{
            color: yellow;
            font-weight: bold;
          }
        `}
        </style>
      </>
    );
  }
}

export default connect((state) => ({
  recordingStatus: state.app.get('recordingStatus').toJS(),
  uiSettings: state.app.get('uiSettings'),
  mode: state.app.get('mode'),
  isAtLeastOneCountingAreasDefined: state.counter.get('countingAreas').size > 0,
}))(UIControls);
