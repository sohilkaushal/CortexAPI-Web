import React, { PureComponent } from 'react';
import { RadialBarChart, RadialBar, Legend } from 'recharts';
import Typography from '@material-ui/core/Typography';
import Title from './Title';

const data = [
  {
    name: 'Delta ', uv: 20, pv: 56, fill: '#8884d8',
  },
  {
    name: 'Theta', uv: 20, pv: 4567, fill: '#83a6ed',
  },
  {
    name: 'Alpha', uv: 20, pv: 1398, fill: '#8dd1e1',
  },
  {
    name: 'Beta', uv: 8.22, pv: 9800, fill: '#82ca9d',
  },
  {
    name: 'Gamma', uv: 8.63, pv: 3908, fill: '#a4de6c',
  },
 
];

const style = {
  top: 0,
  left: 350,
  lineHeight: '24px',
};


export default class Example extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/9km41z5z/';

  render() {
    return (
      <React.Fragment>
      <Title>Channel Data</Title>
      
      <Typography component="p" variant="h6">
      
      </Typography>

      <RadialBarChart width={500} height={300} cx={150} cy={150} innerRadius={50} outerRadius={140} barSize={10} data={data}>
        <RadialBar minAngle={20} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="uv" />
        <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
      </RadialBarChart>
      </React.Fragment>
    );
  }
}
