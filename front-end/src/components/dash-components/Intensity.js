import React, { PureComponent } from 'react';
import Typography from '@material-ui/core/Typography';
import Title from './Title';
import {
  PieChart, Pie, Sector, Cell,
} from 'recharts';

const data = [
  { name: 'Group A', value: 100 }, 
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


export default class Example extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/3Leoa7f4/';

  render() {
    return (
      <React.Fragment>
      <Title>Intensity</Title>
      
      <Typography component="p" variant="h6">
      
      </Typography>
      <PieChart width={300} height={300} onMouseEnter={this.onPieEnter}>
        <Pie
          data={data}
          cx={100}
          cy={115}
          innerRadius={60}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={0}
          dataKey="value"
          label={true}
        >
          {
            data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
    
      </PieChart>
      <p>test</p>
      </React.Fragment>

    );
  }
}