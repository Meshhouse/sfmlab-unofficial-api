import {
  Entity,
  Column,
  PrimaryColumn
} from 'typeorm';

@Entity({
  name: 'sfmlab_model',
  orderBy: { id: 'DESC' }
})
export class SFMLabModel {

  @PrimaryColumn('double')
  id!: number;

  @Column('text', { default: '' })
  title!: string;

  @Column('text', { default: '' })
  author!: string;

  @Column('text', { default: '' })
  description!: string;

  @Column()
  mature_content!: boolean;

  @Column('date', { default: 0 })
  created_at!: number;

  @Column('date', { default: 0 })
  updated_at!: number;

  @Column('text', { default: '' })
  thumbnail!: string;

  @Column('text')
  images!: string[] | string;

  image_thumbs?: string[];

  @Column('text')
  links!: ModelLink[] | string;

  @Column('text', { default: '.sfm' })
  extension!: string;

  @Column('text', { default: '' })
  file_size!: string;

  @Column('text', { default: '[]' })
  tags!: string[] | string;

  @Column('text', { default: '[]' })
  commentaries!: Comment[] | string;
}
