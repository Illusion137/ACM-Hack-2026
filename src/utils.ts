import type { Course } from "./types";

export type GradeStanding = "good" | "okay" | "poor";

export function isPastDue(due: number, now = Date.now()): boolean {
    return due < now;
}

export function calculateGrade(course: Course, now = Date.now()) {
    const { quiz } = course;
    const quiz_points = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const quiz_taken = quiz.completed_points !== null;

    let earned = 0;
    let possible = 0;
    course.lessons.forEach((l) => {
        if (l.completed) {
            earned += l.completed_points;
            possible += l.points;
        } else if (isPastDue(l.due, now)) {
            possible += l.points;
        }
    });
    if (quiz_taken) {
        earned += quiz.completed_points ?? 0;
        possible += quiz_points;
    } else if (isPastDue(quiz.due, now)) {
        possible += quiz_points;
    }

    const percent = possible ? Math.round((earned / possible) * 100) : 0;

    let standing: GradeStanding;
    if (percent >= 80) standing = "good";
    else if (percent >= 60) standing = "okay";
    else standing = "poor";

    return { percent, standing, earned, possible, quiz_points, quiz_taken };
}
