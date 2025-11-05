let selectedCourseId = null;
let selectedSubjectId = null;

async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        const courses = await response.json();

        const grid = document.getElementById('coursesGrid');
        grid.innerHTML = '';

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `<h3>${course.name}</h3>`;
            card.onclick = () => selectCourse(course.id);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

async function selectCourse(courseId) {
    selectedCourseId = courseId;
    try {
        const response = await fetch(`/api/courses/${courseId}/subjects`);
        const subjects = await response.json();

        const grid = document.getElementById('subjectsGrid');
        grid.innerHTML = '';

        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.innerHTML = `<h3>${subject.name}</h3>`;
            card.onclick = () => selectSubject(subject.id);
            grid.appendChild(card);
        });

        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

async function selectSubject(subjectId) {
    selectedSubjectId = subjectId;
    try {
        const response = await fetch('/api/test-types');
        const testTypes = await response.json();

        const grid = document.getElementById('testTypesGrid');
        grid.innerHTML = '';

        testTypes.forEach(testType => {
            const card = document.createElement('div');
            card.className = 'test-type-card';
            card.innerHTML = `<h3>${testType.name}</h3>`;
            card.onclick = () => startTest(subjectId, testType.id);
            grid.appendChild(card);
        });

        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
    } catch (error) {
        console.error('Error loading test types:', error);
    }
}

function startTest(subjectId, testTypeId) {
    window.location.href = `/test/${subjectId}/${testTypeId}`;
}

function backToStep1() {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    selectedCourseId = null;
}

function backToStep2() {
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    selectedSubjectId = null;
}

async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Загружаем курсы при загрузке страницы
loadCourses();
