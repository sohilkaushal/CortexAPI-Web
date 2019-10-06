import React, { PureComponent } from 'react';
import { Legend, Line, LineChart, Tooltip, XAxis } from 'recharts';

export default class ChannelCaptureChart extends PureComponent {
  constructor(params) {
    super(params);
    this.state = {
      chartData: [],
      title: '',
      dataKeys: [],
      chartColors: ['black'],
    };
  }

  componentDidMount = () => {
    const { title, chartData, chartColors } = this.props;
    this.setState({
      title,
      chartData,
      dataKeys: chartData.length > 0 ? Object.keys(chartData[0]).filter((key) => key !== 'time') : [],
      chartColors,
    });
  }

  componentDidUpdate = (prevProps, prevState, snapshot) => {
    const { title, chartData, chartColors } = this.props;
    if (title === prevProps.title
      && chartData === prevProps.chartData) {
      return;
    }
    const state = {
      ...prevState,
      title,
      chartData,
      dataKeys: chartData.length > 0 ? Object.keys(chartData[0]).filter((key) => key !== 'time') : [],
      chartColors,
    };

    this.setState(state);
  }

  render() {
    return (
      <div>
        <div><b>{this.state.title}</b></div>
        <LineChart
          width={530}
          height={200}
          data={this.state.chartData}
          margin={{
            top: 5, right: 5, left: 5, bottom: 5,
          }}>
          <Tooltip labelFormatter={(value) => new Date(value * 1000).toLocaleString()} />
          <Legend />
          <XAxis
            dataKey="time"
            domain={["dataMin", "dataMax"]}
            type="number"
            scale="utc"
            tickFormatter={(value) => new Date(value * 1000).toLocaleTimeString()} />
          {
            this.state.dataKeys.map((key, index) => <Line key={key} type="monotone" dataKey={key} strokeWidth={2} stroke={this.state.chartColors[index % this.state.chartColors.length]} />)
          }
        </LineChart>
      </div>
    );
  }
}
