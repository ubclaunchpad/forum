import { afterEach, before, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import {  supa } from "../../_shared/db.ts";
import { DEFAULT_FILE_MANAGER_OPTIONS, FileManager, fileManager } from "../../_shared/utils/fileManager.ts";
import { assertEquals } from "jsr:@std/assert/equals";
import { DuplicateBucketError, StorageBucketNotFoundError, InputValidationError } from "../../_shared/errors.ts";
import { assertNotEquals, assertRejects } from "jsr:@std/assert";
import { setTimeout } from "node:timers/promises";

describe("File Manager", () => {
    let fileManagerInstance: FileManager;

    before(() => {
        fileManagerInstance = fileManager(supa)(DEFAULT_FILE_MANAGER_OPTIONS);
    });

    beforeEach(async () => {
        const buckets = await fileManagerInstance.buckets.listBuckets();
        for (const bucket of buckets) {
            await fileManagerInstance.files.deleteFiles(bucket.name);

            await fileManagerInstance.buckets.deleteBucket(bucket.name);
        }
    });

    afterEach(async () => {
        const buckets = await fileManagerInstance.buckets.listBuckets();
        for (const bucket of buckets) {
            await fileManagerInstance.files.deleteFiles(bucket.name);
            await fileManagerInstance.buckets.deleteBucket(bucket.name);
        }

    });

    describe("When handling buckets", () => {
        it("should create a bucket", async () => {
            const bucketName = "test";
            const returnedBucket = await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            assertEquals(returnedBucket.name, bucketName);
        });

        it("should throw an error if attempting to create a duplicate bucket", async () => {
            const bucketName = "test";
            const returnedBucket = await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            assertEquals(returnedBucket.name, bucketName);
            await assertRejects(async () => await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            }), DuplicateBucketError);

        });

        it("should throw an error if attempting to delete a nonexistent bucket", async () => {
            const bucketName = "test";
            await assertRejects(async () => await fileManagerInstance.buckets.deleteBucket(bucketName), StorageBucketNotFoundError);
        });

        it("should list buckets and return empty array if no buckets exist", async () => {
            const buckets = await fileManagerInstance.buckets.listBuckets();
            assertEquals(buckets.length, 0);
        });

        it("should delete a bucket", async () => {
            const bucketName = "test";
            await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            await fileManagerInstance.buckets.deleteBucket(bucketName);
            const buckets = await fileManagerInstance.buckets.listBuckets();
            assertEquals(buckets.length, 0);
        });

    });

    describe("When using a bucket", () => {
        it("should upload a file", async () => {
            const bucketName = "test";
            await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            const file = new File(["test"], "test.png", { type: "image/png" });
            const uploadedFile = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file);
            assertEquals(uploadedFile.name, file.name);
        });

        it("should throw an error if the bucket does not exist", async () => {
            const bucketName = "non-existent-bucket";
            await assertRejects(async () => await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(new File(["test"], "test.png", { type: "image/png" })), StorageBucketNotFoundError, "Bucket not found");
            const files = await fileManagerInstance.files.getFiles(bucketName);
            assertEquals(files?.length, 0)
        });

    });

    describe("When handling files"), () => {

    }

    describe("Test delete trigger", () => {
        const filePath = "testdelete.png";
        const bucket = "test";
        const fileId = "01f49131-63dc-4e66-9fbf-ea9fa152b13b";

        it("should upload a file", async () => {    
            const bucketName = "test";
            await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            const file = new File(["test"], "testdelete.png", { type: "image/png" });
            const uploadedFile = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file);
            assertEquals(uploadedFile.name, file.name);
        });

        it("should add row to files table", async () => {
            const newFile = {
                "id": fileId,
                "name": "testFile",
                "type": "image/png",
                "size": 1200,
                "path": filePath,
                "bucket": bucket
            };
            const { data: file, error: error } = await supa.from("files").insert({...newFile}).select().single();
            if (error) {
                throw new InputValidationError("Failed to create file entry: " + error.message);
            }

            await setTimeout(1000);

            assertEquals(file.id, fileId);
        });
        it("should delete entry from files table", async () => {
            const { error } = await supa.from("files").delete().eq('id', fileId);

            if (error) {
                throw new Error("failed to delete entry: " + error.message);
            }
        });
        it("file should be deleted from storage", async () => {
            const {data, error} = await supa.storage.from(bucket).list();
            
            if (error) {
                throw new Error("failed to delete entry: " + error.message);
            }

            for (const file of data) {
                assertNotEquals(file.name, filePath);
            }
        });
    });
});
    
