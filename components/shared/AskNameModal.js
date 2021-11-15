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
      point1_lat: null,
      point1_lon: null,
      point2_lat: null,
      point2_lon: null,
      point3_lat: null,
      point3_lon: null,
      point4_lat: null,
      point4_lon: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.escFunction = this.escFunction.bind(this);
  }

  handleChange(event) {
    this.setState({ name: event.target.value });
  }

  handleLatLonChange = name => (event) => {
      switch(name)   {
        case 'point1_lat':
          this.setState({point1_lat: event.target.value});
          break;
        case 'point1_lon':
          this.setState({point1_lon: event.target.value});
          break;
        case 'point2_lat':
          this.setState({point2_lat: event.target.value});
          break;
        case 'point2_lon':
          this.setState({point2_lon: event.target.value});
          break;
        case 'point3_lat':
          this.setState({point3_lat: event.target.value});
          break;
        case 'point3_lon':
          this.setState({point3_lon: event.target.value});
          break;
        case 'point4_lat':
          this.setState({point4_lat: event.target.value});
          break;
        case 'point4_lon':
          this.setState({point4_lon: event.target.value});
          break;
        default:
          return;
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
                const gps_coordinates = {
                  gps_point0: {lat:this.state.point1_lat,lon:this.state.point1_lon},
                  gps_point1: {lat:this.state.point2_lat,lon:this.state.point2_lon},
                  gps_point2: {lat:this.state.point3_lat,lon:this.state.point3_lon},
                  gps_point3: {lat:this.state.point4_lat,lon:this.state.point4_lon},
                };
                this.props.saveGPS(gps_coordinates);
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
                <div className="grid grid-cols-3">
                  <div className="bg-white rounded-tl w-33 align-middle">1st Point</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point1_lat} onChange={this.handleLatLonChange('point1_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-tr py-2 px-3 w-33" value={this.state.point1_lon} onChange={this.handleLatLonChange('point1_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white w-33 align-middle">2nd Point</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point2_lat} onChange={this.handleLatLonChange('point2_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point2_lon} onChange={this.handleLatLonChange('point2_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white w-33 align-middle">3rd Point</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point3_lat} onChange={this.handleLatLonChange('point3_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point3_lon} onChange={this.handleLatLonChange('point3_lon')} placeholder="Longitude" /></div>
                  <div className="bg-white rounded-bl w-33 align-middle">4th Point</div>
                  <div><input type="text" className="appearance-none py-2 px-3 w-33" value={this.state.point4_lat} onChange={this.handleLatLonChange('point4_lat')} placeholder="Latitude" /></div>
                  <div><input type="text" className="appearance-none rounded-br py-2 px-3 w-33" value={this.state.point4_lon} onChange={this.handleLatLonChange('point4_lon')} placeholder="Longitude" /></div>
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
