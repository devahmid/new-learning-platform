import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-child',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-child.component.html',
  styleUrl: './edit-child.component.scss'
})
export class EditChildComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  form!: FormGroup;
  userId!: number;

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();

    this.userService.getById(this.userId).subscribe((user) => {
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        levelId: user.level?.id,
        childProfile: {
          isAvailableWednesdayMorning: user.childProfile?.isAvailableWednesdayMorning,
          arabicLevel: user.childProfile?.arabicLevel,
          disabilities: user.childProfile?.disabilities ?? [],
        },
      });
    });
  }

  initForm() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [''],
      levelId: [null],
      childProfile: this.fb.group({
        isAvailableWednesdayMorning: [false],
        arabicLevel: [''],
        disabilities: [[]],
      }),
    });
  }

  submit() {
    if (this.form.invalid) return;

    const value = this.form.value;

    const payload = {
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      level: { id: value.levelId },
      childProfile: value.childProfile,
    };

    this.userService.updateChild(this.userId, payload).subscribe(() => {
      this.router.navigate(['/admin/users']);
    });
  }
}
