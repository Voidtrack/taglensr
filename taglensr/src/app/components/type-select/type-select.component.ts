import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PostType } from '../../models/post';

@Component({
  selector: 'app-type-select',
  imports: [
    MatIconModule,
    MatButtonToggleModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './type-select.component.html',
})
export class TypeSelectComponent {
  update() {
    this.type.emit(this.filterType);
    this.input.emit();
  }
  @Output() type = new EventEmitter<PostType>();
  @Output() input = new EventEmitter();
  filterType: PostType = PostType.all;
  PostType = PostType;
}
