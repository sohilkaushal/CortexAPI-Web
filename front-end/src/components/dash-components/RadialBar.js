import React, { PureComponent } from 'react';
import { RadialBarChart, RadialBar, Legend } from 'recharts';
import Typography from '@material-ui/core/Typography';
import Title from './Title';

const data = [
  {
    name: 'Delta ', uv: 4,  fill: '#8884d8',
  },
  {
    name: 'Theta', uv: 6,  fill: '#83a6ed',
  },
  {
    name: 'Alpha', uv: 7,  fill: '#8dd1e1',
  },
  {
    name: 'Beta', uv: 1,  fill: '#82ca9d',
  },
  {
    name: 'Gamma', uv: 8.1,  fill: '#a4de6c',
  },
 
];

const style = {
  top: 0,
  left: 350,
  lineHeight: '54px',
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
