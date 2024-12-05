# import uuid

# from fastapi.testclient import TestClient
# from main import app
# from routers.res.courses_res import (
#     CreateCourseResponse,
#     DeleteCourseResponse,
#     GetCoursesResponse,
#     UpdateCourseResponse,
# )

# client = TestClient(app)
# course_router_endpoint = "courses"
# email = "test"
# course_id = "daeed462-ed57-48f7-91d8-d669c406b606"


# def test_insert_course():
#     test_course = {
#         "id": course_id,
#         "c_group": "test_group",
#         "code": "test_code",
#         "section": "test_term",
#     }
#     response = client.post(course_router_endpoint, json=test_course)
#     assert response.status_code == 200
#     data = CreateCourseResponse.model_validate(response.json())
#     assert data.msg == "success"


# def test_insert_duplicate_course():
#     test_course = {
#         "id": course_id,
#         "c_group": "test_group",
#         "code": "test_code",
#         "section": "test_term",
#     }
#     response = client.post(course_router_endpoint, json=test_course)
#     assert response.status_code == 404
#     assert response.json() == {"detail": "Failed to create course."}


# def test_get_all_courses():
#     response = client.get(course_router_endpoint)
#     data = GetCoursesResponse.model_validate(response.json())
#     assert len(data.courses) == 1
#     assert str(data.courses[0].id) == course_id
#     assert response.status_code == 200


# def test_get_course_by_id():
#     response = client.get(course_router_endpoint + "/" + str(course_id))
#     data = GetCoursesResponse.model_validate(response.json())
#     assert isinstance(data.courses, list)
#     assert len(data.courses) == 1
#     assert str(data.courses[0].id) == course_id
#     assert response.status_code == 200


# def test_get_course_by_id_not_found():
#     response = client.get(course_router_endpoint + "/" + str(uuid.uuid4()))
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User is not enrolled in this course"}


# def test_update_course_by_id():
#     update_req = {
#         "c_id": course_id,
#         "name": "Applied Machine Learning",
#         "c_group": "CPSC",
#         "code": "330",
#         "end_date": "2024-12-20",
#     }
#     response = client.put(course_router_endpoint, json=update_req)
#     data = UpdateCourseResponse.model_validate(response.json())
#     assert response.status_code == 200
#     assert data.msg == "success"
#     assert data.updated.name == "Applied Machine Learning"
#     assert data.updated.c_group == "CPSC"
#     assert data.updated.code == "330"
#     assert str(data.updated.end_date) == "2024-12-20"


# def test_delete_course_by_id():
#     response = client.delete(
#         course_router_endpoint + "/" + str(course_id),
#     )
#     assert response.status_code == 200
#     data = DeleteCourseResponse.model_validate(response.json())
#     assert data.msg == "success"
#     assert str(data.deleted) == course_id
