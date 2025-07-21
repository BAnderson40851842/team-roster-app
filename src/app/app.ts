import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import moment from 'moment-timezone';

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  teamId: string;
  roles: string[];
  timezone: string;
}

interface Assignment {
  teamId: string;
  memberId: string;
  shift: string;
}

interface Roster {
  date: string;
  assignments: Assignment[];
}

interface RosterData {
  teams: Team[];
  members: Member[];
  rosters: Roster[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container mt-4" >
      <!-- Template unchanged -->
      <h1>Daily Roster</h1>
      <div class="mb-3 d-flex align-items-center gap-3 flex-wrap">
        <label for="datePicker" class="form-label mb-0">Select Date:</label>
        <input id="datePicker" type="date" class="form-control w-auto"
          [(ngModel)]="selectedDate" (change)="changeDate(selectedDate)" />
        <label for="roleSelect" class="form-label mb-0">Simulated User Role:</label>
        <select id="roleSelect" class="form-select w-auto" [ngModel]="currentUser.role"
          (ngModelChange)="setRole($event)">
          <option *ngFor="let r of availableRoles" [value]="r">{{r}}</option>
        </select>
      </div>
      <div *ngIf="roster; else noData">
        <div *ngFor="let team of teams" class="mb-4">
          <h3>{{team.name}}</h3>
          <table class="table table-striped">
          <thead>
              <tr><th>Member</th><th>Shift Time</th><th>Role(s)</th></tr>
          </thead>
            <tbody>
              <tr *ngFor="let assignment of getAssignmentsForTeam(team.id)">
                 <td>{{getMemberById(assignment.memberId)?.name}}</td>
                <td>{{formatShift(assignment.shift, getMemberById(assignment.memberId)?.timezone || 'UTC')}}</td>
                 <td>{{ getMemberById(assignment.memberId)?.roles?.join(', ') ?? 'No role' }}</td>
              </tr>
               <tr *ngIf="getAssignmentsForTeam(team.id).length === 0">
                <td colspan="3" class="text-center">No assignments for this team on this day.</td>
              </tr>
             </tbody>
           </table>
         </div>
       </div>

      <ng-template #noData>
        <p>No data available</p>
      </ng-template>
    </div>
  `
})
export class App implements OnInit {
  today = moment().format('YYYY-MM-DD');
  selectedDate = this.today;
  data: RosterData | null = null;
  roster?: Roster;
  teams: Team[] = [];
  members: Member[] = [];

  currentUser = { id: 'user1', name: 'Alice', role: 'Manager', teamId: 'op-support' };
  availableRoles = ['Manager', 'Team Leader', 'Member', 'Administrator'];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<RosterData>('./assets/roster-data.json').subscribe({
      next: (data) => { 
        this.data = data;
        this.teams = data.teams;
        this.members = data.members;
        this.updateRoster();
      },
      error: (err) => {
        console.error('Failed to load roster data', err);
        alert('Failed to load roster data');
      }
    });
  }

  changeDate(date: string) {
    this.selectedDate = date;
    this.updateRoster();
  }

  updateRoster() {
    if (!this.data) return;
    this.roster = this.data.rosters.find(r => r.date === this.selectedDate);
  }

  getAssignmentsForTeam(teamId: string): Assignment[] {
    return this.roster ? this.roster.assignments.filter(a => a.teamId === teamId) : [];
  }

  getMemberById(id: string): Member | undefined {
    return this.members.find(m => m.id === id);
  }

  formatShift(shift: string, timezone: string): string {
    try {
      const [start, end] = shift.split('-');
      const date = this.selectedDate;
      const startTime = moment.tz(date + ' ' + start, 'YYYY-MM-DD HH:mm', timezone);
      let endTime = moment.tz(date + ' ' + end, 'YYYY-MM-DD HH:mm', timezone);
      if (end === '00:00') endTime = endTime.add(1, 'day');
      return `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')} (${timezone})`;
    } catch {
      return `${shift} (${timezone})`;
    }
  }

  setRole(role: string) {
    this.currentUser.role = role;
  }
}