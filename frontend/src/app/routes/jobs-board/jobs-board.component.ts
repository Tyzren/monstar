import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { JobService } from '@services/api/jobs.api.service';
import { UserService } from '@services/api/user.service';
import { IJob } from '@models/job.schema';
import { buildOrgLogoMap } from '../../shared/utils/string-similarity';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { ToolbarModule } from 'primeng/toolbar';
import { FooterService } from '../../shared/services/footer.service';

@Component({
  selector: 'app-jobs-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    ScrollPanelModule,
    SkeletonModule,
    TagModule,
    ChipModule,
    ToolbarModule,
  ],
  templateUrl: './jobs-board.component.html',
  styleUrl: './jobs-board.component.scss',
})
export class JobsBoardComponent implements OnInit, OnDestroy {
  @ViewChild('jobsBoardContainer') jobsBoardContainer!: ElementRef;
  @ViewChild('logoFileInput') logoFileInput!: ElementRef<HTMLInputElement>;

  private destroyRef = inject(DestroyRef);
  private jobService = inject(JobService);
  private userService = inject(UserService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private footerService = inject(FooterService);

  jobs: IJob[] = [];
  filteredJobs: IJob[] = [];
  selectedJob: IJob | null = null;
  mobileDetailOpen = false;
  loading = true;

  isAdmin = false;
  orgLogoMap = new Map<string, string>();
  private _uploadTargetOrg = '';

  statusFilter = 'All';
  statusOptions = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  roleTypeFilter = 'All';
  roleTypeOptions: { label: string; value: string }[] = [
    { label: 'All Role Types', value: 'All' },
  ];

  isSplitView = false;
  splitViewMinWidth = 1024;

  private resizeHandler = () => {
    this.isSplitView = window.innerWidth >= this.splitViewMinWidth;
    if (this.isSplitView && this.mobileDetailOpen) {
      this.closeDetail();
    }
  };

  ngOnInit(): void {
    this.footerService.hideFooter();
    this.isSplitView = window.innerWidth >= this.splitViewMinWidth;
    window.addEventListener('resize', this.resizeHandler);
    this.updateMetaTags();
    this.loadJobs();

    this.userService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.isAdmin = !!user?.admin;
      });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    document.body.style.overflow = '';
    this.footerService.showFooter();
    this.meta.removeTag("name='description'");
    this.meta.removeTag("name='keywords'");
  }

  private loadJobs(): void {
    forkJoin({
      jobs: this.jobService.getAllJobs(),
      logos: this.jobService.getOrgLogos(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ jobs, logos }) => {
          this.jobs = jobs;
          this.orgLogoMap = buildOrgLogoMap(jobs, logos);
          this.buildRoleTypeOptions();
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private buildRoleTypeOptions(): void {
    const roleTypes = new Set<string>();
    this.jobs.forEach((job) => job.roleType.forEach((rt) => roleTypes.add(rt)));
    this.roleTypeOptions = [
      { label: 'All Role Types', value: 'All' },
      ...[...roleTypes].sort().map((rt) => ({ label: rt, value: rt })),
    ];
  }

  applyFilters(): void {
    this.filteredJobs = this.jobs
      .filter((job) => {
        const matchesStatus =
          this.statusFilter === 'All' || job.status === this.statusFilter;
        const matchesRole =
          this.roleTypeFilter === 'All' ||
          job.roleType.includes(this.roleTypeFilter);
        return matchesStatus && matchesRole;
      })
      .sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'OPEN' ? -1 : 1;
      });

    if (
      this.selectedJob &&
      !this.filteredJobs.includes(this.selectedJob)
    ) {
      this.selectedJob = this.filteredJobs[0] || null;
    }

    if (!this.selectedJob && this.filteredJobs.length > 0) {
      this.selectedJob = this.filteredJobs[0];
    }
  }

  selectJob(job: IJob): void {
    this.selectedJob = job;
    if (!this.isSplitView) {
      this.mobileDetailOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeDetail(): void {
    this.mobileDetailOpen = false;
    document.body.style.overflow = '';
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'OPEN' ? 'success' : 'danger';
  }

  formatDate(date: string | Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  getLogoUrl(job: IJob): string | undefined {
    return this.orgLogoMap.get(job.organisation.toLowerCase().trim());
  }

  onIconClick(event: MouseEvent, job: IJob): void {
    if (this.isAdmin && !this.getLogoUrl(job)) {
      event.stopPropagation();
      this.onLogoUpload(job);
    }
  }

  onLogoUpload(job: IJob): void {
    this._uploadTargetOrg = job.organisation;
    this.logoFileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this._uploadTargetOrg) return;

    this.jobService
      .uploadOrgLogo(file, this._uploadTargetOrg)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const normalised = this._uploadTargetOrg.toLowerCase().trim();
          this.orgLogoMap.set(normalised, res.data.logoUrl);
          this._uploadTargetOrg = '';
          input.value = '';
        },
        error: () => {
          this._uploadTargetOrg = '';
          input.value = '';
        },
      });
  }

  private updateMetaTags(): void {
    this.titleService.setTitle('Jobs Board | MonSTAR');
    this.meta.updateTag({
      name: 'description',
      content:
        'Browse student job opportunities, internships, and graduate roles curated for Monash students.',
    });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'monash jobs, student jobs, internships, graduate roles, monash university',
    });
  }
}
