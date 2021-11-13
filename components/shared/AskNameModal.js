import React, { Component } from 'react';
import SVG from 'react-inlinesvg';
import CanvasEngine from '../canvas/CanvasEngine';
import { CANVAS_RENDERING_MODE } from '../../utils/constants';
import { EDITOR_MODE } from '../../statemanagement/app/CounterStateManagement';
import { connect } from 'react-redux';

class AskNameModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name || '',
      inputDisabled: false,
      showGPS: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.escFunction = this.escFunction.bind(this);
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  handleClick = value => (e) => {
    this.state.name = value;
    this.state.inputDisabled = true;
    this.state.showGPS = false;
    if(value === 'GPS Quadrilateral'){
      this.state.showGPS = true;
    }
    e.preventDefault();
  };


  escFunction(event) {
    if (event.keyCode === 27) {
      this.props.cancel();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.escFunction, false);
    console.log('Points: '+this.props.points);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.escFunction, false);
  }

  render() {
    return (
      <div className="overlay">
        <form
          className="ask-name flex flex-wrap justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (this.state.name !== '') {
              this.props.save(this.state.name);
            }
          }}
        >
          <input
            type="text"
            className={`appearance-none rounded-l py-2 px-3  ${this.state.showGPS ? "gps_width" : ""}`}
            value={this.state.name}
            disabled={this.state.inputDisabled}
            onChange={this.handleChange}
            placeholder="Counter name"
            autoFocus
          />
          <input
            type="submit"
            className="btn btn-default cursor-pointer"
            value="OK"
          />
          <button
            className="btn btn-default p-0"
            onClick={() => this.props.cancel()}
          >
            <SVG
              className="w-10 h-10 svg-icon flex items-center"
              cacheRequests
              src="/static/icons/ui/close.svg"
              aria-label="icon close"
            />
          </button>
          {this.props.lastEditingMode === EDITOR_MODE.EDIT_LINE
          && (
            <>
              <button
                title="Calculate Wait Time"
                className="btn btn-default p-0"
                onClick={this.handleClick('Wait Time')}
              >
                <SVG
                  className="w-10 h-10 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/stopwatch.svg"
                  aria-label="icon stopwatch"
                />
              </button>
              <button
                title="Set Alarm"
                className="btn btn-default p-0"
                onClick={this.handleClick('Alarm')}
              >
                <SVG
                  className="w-10 h-10 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/bell.svg"
                  aria-label="icon bell"
                />
              </button>
              <button
                title="Launch the Drone"
                className="btn btn-default p-0 rounded-r"
                onClick={this.handleClick('Launch Drone')}
              >
                <SVG
                  className="w-10 h-10 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/drone.svg"
                  aria-label="icon drone"
                />
              </button>
            </>
          )}
          {this.props.lastEditingMode === EDITOR_MODE.EDIT_POLYGON
          && (
            <>
              <button
                title="Set Alarm"
                className="btn btn-default p-0"
                onClick={this.handleClick('Alarm')}
              >
                <SVG
                  className="w-10 h-10 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/bell.svg"
                  aria-label="icon bell"
                />
              </button>
              <button
                title="Identify GPS for Drone"
                className="btn btn-default p-0 rounded-r"
                onClick={this.handleClick('GPS Quadrilateral')}
                disabled={`{${this.props.points === 4 ? "false" : "true"}`}
              >
                <SVG
                  className="w-10 h-10 svg-icon flex items-center"
                  cacheRequests
                  src="/static/icons/ui/gps.svg"
                  aria-label="icon gps"
                />
              </button>
            </>
          )}
          {this.state.showGPS === true
          && (
            <>
              <div className="flex flex-row">
                <div className="grid grid-cols-3">
                  <div className="bg-white rounded-tl w-33">Bottom Left</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-tr py-2 px-3 w-33" value="" onChange="" placeholder="Longitude" /></div>
                  <div className="bg-white w-33">Bottom Right</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Longitude" /></div>
                  <div className="bg-white w-33">Top Right</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Longitude" /></div>
                  <div className="bg-white rounded-bl w-33">Top Left</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value="" onChange="" placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-br py-2 px-3 w-33" value="" onChange="" placeholder="Longitude" /></div>
                </div>
              </div>
            </>
          )}
        </form>
        <CanvasEngine mode={CANVAS_RENDERING_MODE.COUNTING_AREAS} />
        <style jsx>
          {`
          .overlay {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            z-index: 8;
          }

          .ask-name{
            text-align: center;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 6;
          }

          .gps_width {
            width: 510px;
          }
        `}
        </style>
      </div>
    );
  }
}

export default connect((state) => ({
  lastEditingMode: state.counter.get('lastEditingMode'),
}))(AskNameModal);
