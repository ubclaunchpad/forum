from fastapi.testclient import TestClient

from backend.main import app

INSERT_ENDPOINT = "/courses/create"
UPDATE_ENDPOINT = "/courses/update"
GET_ENDPOINT = "/courses/page"
GET_ID_ENDPOINT = "/courses"
DELETE_ENDPOINT = "/courses/delete"
REGISTER_ENDPOINT = "/courses/register"

client = TestClient(app)

email = "test"
course_id = "test"

def test_insert_course():
    test_course = {
        "c_group": "test_group",
        "c_code": "test_code",
        "term": "test_term"
    }
    response = client.post(INSERT_ENDPOINT, json=test_course)
    assert response.status_code == 200

def test_insert_duplicate_course():
    test_course = {
        "c_group": "test_group",
        "c_code": "test_code",
        "term": "test_term"
    }
    response = client.post(INSERT_ENDPOINT,json=test_course)
    assert response.status_code == 404
    assert response.json() == {"detail":"Failed to create course."}

def test_insert_course_invalid_creds():
    invalid_header = {}
    response = client.post(INSERT_ENDPOINT)
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to access this course."
    }

def test_get_courses():
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 200

def test_get_courses_by_id():
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 200

def test_get_courses_not_found():
    header = {}
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_get_courses_invalid_creds():
    invalid_header = {}
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to access this course."
    }

def test_get_all_courses():
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 200

def test_get_all_courses_invalid_cred():
    response = client.get(GET_ENDPOINT)
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_get_course_by_id():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 200

def test_get_course_by_id_not_found():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_get_course_by_id_invalid_creds():
    response = client.get(f"/courses/{course_id}")
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_update_course_by_id():
    response = client.put(UPDATE_ENDPOINT)
    assert response.status_code == 200

def test_update_course_by_id_not_found():
    response = client.put(UPDATE_ENDPOINT)
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_update_course_by_id_invalid_creds():
    response = client.put(UPDATE_ENDPOINT)
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }

def test_delete_course_by_id():
    response = client.delete(DELETE_ENDPOINT)
    assert response.status_code == 200

def test_delete_course_by_id_not_found():
    response = client.delete(DELETE_ENDPOINT)
    assert response.status_code == 404
    assert response.json() == {"detail": "Course not found."}

def test_delete_course_by_id_invalid_creds():
    response = client.delete(DELETE_ENDPOINT)
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to perform this action."
    }