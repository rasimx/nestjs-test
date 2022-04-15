import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model {
  timestamps: false;
  @Column({
    type: DataType.STRING,
  })
  name?: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  email?: string;

  @Column({
    type: DataType.STRING,
    unique: true,
  })
  phone?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;
}
