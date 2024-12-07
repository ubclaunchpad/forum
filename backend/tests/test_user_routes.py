# from fastapi.testclient import TestClient
# from routers.routes.old.users import user_router

# client = TestClient(user_router)

# email = "test"
# user_id = "test"


# def test_get_profile():
#     response = client.get("/users/me")
#     print(response)
#     assert response.status_code == 200


# def test_get_profile_not_found():
#     # header = {}
#     response = client.get("/users/me")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_get_profile_invalid_creds():
#     # invalid_header = {}
#     response = client.get("/users/me")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to access this profile."
#     }


# def test_update_profile():
#     response = client.post("/users/me")
#     assert response.status_code == 200


# def test_update_profile_not_found():
#     # header = {}
#     response = client.post("/users/me")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_update_profile_invalid_creds():
#     # invalid_header = {}
#     response = client.post("/users/me")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to access this profile."
#     }


# def test_delete_profile():
#     response = client.delete("/users/me")
#     assert response.status_code == 200


# def test_delete_profile_not_found():
#     # header = {}
#     response = client.delete("/users/me")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_delete_profile_invalid_creds():
#     # invalid_header = {}
#     response = client.delete("/users/me")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to access this profile."
#     }


# def test_get_all_users():
#     response = client.get("/users")
#     assert response.status_code == 200


# def test_get_all_users_invalid_cred():
#     response = client.get("/users")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_get_user_by_id():
#     response = client.get(f"/users/{user_id}")
#     assert response.status_code == 200


# def test_get_user_by_id_not_found():
#     response = client.get(f"/users/{user_id}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_get_user_by_id_invalid_creds():
#     response = client.get(f"/users/{user_id}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_update_user_by_id():
#     response = client.post(f"/users/{user_id}")
#     assert response.status_code == 200


# def test_update_user_by_id_not_found():
#     response = client.post(f"/users/{user_id}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_update_user_by_id_invalid_creds():
#     response = client.post(f"/users/{user_id}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_delete_user_by_id():
#     response = client.delete(f"/users/{user_id}")
#     assert response.status_code == 200


# def test_delete_user_by_id_not_found():
#     response = client.delete(f"/users/{user_id}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_delete_user_by_id_invalid_creds():
#     response = client.delete(f"/users/{user_id}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_delete_user_by_id_no_permission():
#     response = client.delete(f"/users/{user_id}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_get_user_by_email():
#     response = client.get(f"/users/{email}")
#     assert response.status_code == 200


# def test_get_user_by_email_not_found():
#     response = client.get(f"/users/{email}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_get_user_by_email_invalid_creds():
#     response = client.get(f"/users/{email}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_update_user_by_email():
#     response = client.post(f"/users/{email}")
#     assert response.status_code == 200


# def test_update_user_by_email_not_found():
#     response = client.post(f"/users/{email}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_update_user_by_email_invalid_creds():
#     response = client.post(f"/users/{email}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }


# def test_delete_user_by_email():
#     response = client.delete(f"/users/{email}")
#     assert response.status_code == 200


# def test_delete_user_by_email_not_found():
#     response = client.delete(f"/users/{email}")
#     assert response.status_code == 404
#     assert response.json() == {"detail": "User not found."}


# def test_delete_user_by_email_invalid_creds():
#     response = client.delete(f"/users/{email}")
#     assert response.status_code == 403
#     assert response.json() == {
#         "detail": "You do not have permission to perform this action."
#     }
