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
      gpsDisabled: true,
      showGPS: false,
      bottom_left_lat: null,
      bottom_left_lon: null,
      bottom_right_lat: null,
      bottom_right_lon: null,
      top_right_lat: null,
      top_right_lon: null,
      top_left_lat: null,
      top_left_lon: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.escFunction = this.escFunction.bind(this);
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  handleLatLonChange(event,name) {

    if(typeof event.target !== undefined){
      console.log('Name to change: '+name);
      switch(name)   {
        case 'bottom_left_lat':
          this.setState({bottom_left_lat: event.target.value});
          console.log('BTL: '+this.state.bottom_left_lat);
          break;
        case 'bottom_left_lon':
          this.setState({bottom_left_lon: event.target.value});
          break;
        case 'bottom_right_lat':
          this.setState({bottom_right_lat: event.target.value});
          break;
        case 'bottom_right_lon':
          this.setState({bottom_right_lon: event.target.value});
          break;
        case 'top_right_lat':
          this.setState({top_right_lat: event.target.value});
          break;
        case 'top_right_lon':
          this.setState({top_right_lon: event.target.value});
          break;
        case 'top_left_lat':
          this.setState({top_left_lat: event.target.value});
          break;
        case 'top_left_lon':
          this.setState({top_left_lon: event.target.value});
          break;
        default:
          return;
      }
    }
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
    if(this.props.polyPoints === 4) this.state.gpsDisabled = false;

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
              if(this.state.name === 'GPS Quadrilateral'){
                const latlons = {
                  bottom_left: {lat:this.state.bottom_left_lat,lon:this.state.bottom_left_lon},
                  bottom_right: {lat:this.state.bottom_right_lat,lon:this.state.bottom_right_lon},
                  top_right: {lat:this.state.top_right_lat,lon:this.state.top_right_lon},
                  top_left: {lat:this.state.top_left_lat,lon:this.state.top_left_lon},
                };
                this.props.saveGPS(latlons);
              }
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
                disabled={this.state.gpsDisabled}
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
                <div className="grid grid-cols-3 align-middle">
                  <div className="bg-white rounded-tl w-33 ">Bottom Left</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.bottom_left_lat} onChange={this.handleLatLonChange(this,'bottom_left_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-tr py-2 px-3 w-33" value={this.state.bottom_left_lon} onChange={this.handleLatLonChange(this,'bottom_left_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white w-33">Bottom Right</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.bottom_right_lat} onChange={this.handleLatLonChange(this,'bottom_right_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.bottom_right_lon} onChange={this.handleLatLonChange(this,'bottom_right_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white w-33">Top Right</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.top_right_lat} onChange={this.handleLatLonChange(this,'top_right_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.top_right_lon} onChange={this.handleLatLonChange(this,'top_right_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white rounded-bl w-33">Top Left</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.top_left_lat} onChange={this.handleLatLonChange(this,'top_left_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-br py-2 px-3 w-33" value={this.state.top_left_lon} onChange={this.handleLatLonChange(this,'top_left_lon')} placeholder="Longitude" /></div>
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
