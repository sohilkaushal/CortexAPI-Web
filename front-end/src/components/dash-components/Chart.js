// import React, { PureComponent } from 'react';
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
// } from 'recharts';
// import { setConstantValue } from '../../../node_modules/typescript/lib/typescript';

// export default class Example extends PureComponent {
//   constructor(props) {
//     super(props);
//     this.state = {
//       sample: [
//         {
//           name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
//         },
//         {
//           name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
//         },
//         {
//           name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
//         },
//         {
//           name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
//         },
//         {
//           name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
//         },
//         {
//           name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
//         },
//         {
//           name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
//         },
//       ]
//     };
//   }

//   componentDidMount() {
//     setInterval(() => {
//       const newState = {...this.state};
//       newState.sample = [];
//       for (var i = 0; i < 10; i++)
//         newState.sample.push({ name: 'Page ' + i, pv: Math.random() * 4000, uv: 3490, amt: 2100 });
//       this.setState(newState);
//       this.render(true);
//     }, 5000);
//   }

//   render() {
//     return (
//       <LineChart width={300} height={100} data={this.state.sample}>
//         <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} />
//       </LineChart>
//     );
//   }
// }

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
