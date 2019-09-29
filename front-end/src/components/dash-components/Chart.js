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
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const data = [
  {
    name: 'Page A', uv: 4000, pv: 2400, amt: 2400, a: 2460, b: 2100,
  },
  {
    name: 'Page B', uv: 3000, pv: 1398, amt: 2210, a: 2460, b: 2100,
  },
  {
    name: 'Page C', uv: 2000, pv: 9800, amt: 2290,a: 2460, b: 2100,
  },
  {
    name: 'Page D', uv: 2780, pv: 3908, amt: 2000,a: 2460, b: 2100,
  },
  {
    name: 'Page E', uv: 1890, pv: 4800, amt: 2181,a: 2460, b: 2100,
  },
  {
    name: 'Page F', uv: 2390, pv: 3800, amt: 2500,a: 2460, b: 2100,
  },
  {
    name: 'Page G', uv: 3490, pv: 4300, amt: 2100,a: 2460, b: 2100,
  },
];

export default class Example extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/xqjtetw0/';

  render() {
    return (
      <LineChart
        width={570}
        height={130}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        {/* <XAxis dataKey="name" /> */}
        {/* <YAxis /> */}
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        <Line type="monotone" dataKey="amt" stroke="#82ca9d" />
        <Line type="monotone" dataKey="a" stroke="#82ca9d" />
        <Line type="monotone" dataKey="b" stroke="#82fs4d" />
      </LineChart>
    );
  }
}
