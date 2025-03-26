import { afterEach, before, beforeEach, describe, it } from "jsr:@std/testing/bdd";
import {  supa } from "../../_shared/db.ts";
import { DEFAULT_FILE_MANAGER_OPTIONS, FileManager, fileManager } from "../../_shared/utils/fileManager.ts";
import { assertEquals } from "jsr:@std/assert/equals";
import { DuplicateBucketError, StorageBucketNotFoundError } from "../../_shared/errors.ts";
import {  assertRejects } from "jsr:@std/assert";
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

        it("should not throw an error if the bucket does not exist and create the bucket and upload the file", async () => {
            const bucketName = "non-existent-bucket";
        
            const uploadedFile = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(new File(["test"], "test.png", { type: "image/png" }));
            assertEquals(uploadedFile.name, "test.png");
    
            const files = await fileManagerInstance.files.getFiles(bucketName);
            assertEquals(files?.length, 1);
        });

    });

    describe("File deletion database trigger", () => {
        it("trigger should end up deleting the file from storage when the file is deleted", async () => {
            const bucketName = "test";
            await fileManagerInstance.buckets.createBucket(bucketName, {
                public: true
            });
            const newFile = new File(["test"], "testdelete.png", { type: "image/png" });
            const uploadedFile = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(newFile);

            const { error: deleteError } = await supa.from("files").delete().eq('id', uploadedFile.id);
            if (deleteError) {
                throw new Error("failed to delete file: " + deleteError.message);
            }

            await setTimeout(2000);
            const files = await fileManagerInstance.buckets.usingBucket(bucketName).getFiles();
            assertEquals(files?.length, 0);
        });
        it("trigger should only delete from storage the file that is deleted and not other files", async () => {
            const bucketName = "test";
            await fileManagerInstance.buckets.createBucket(bucketName, {
                public: false
            });
            const file1 = new File(["test"], "testdelete1.png", { type: "image/png" });
            const file2 = new File(["test"], "testdelete2.png", { type: "image/png" });
            const file3 = new File(["test"], "testdelete3.png", { type: "image/png" });
            const uploadedFile1 = await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file1);
            await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file2);
            await fileManagerInstance.buckets.usingBucket(bucketName).uploadFile(file3);

            const { error: deleteError } = await supa.from("files").delete().eq('id', uploadedFile1.id);
            if (deleteError) {
                throw new Error("failed to delete file: " + deleteError.message);
            }

            await setTimeout(2000);

            const files = await fileManagerInstance.buckets.usingBucket(bucketName).getFiles();
            assertEquals(files?.length, 2);
            assertEquals(false, files?.some(file => file.id === uploadedFile1.id));

        });

        it.skip("When multiple files are deleted close to each other, the trigger should delete them from storage and not delete other files or buckets", async () => {});
        it.skip("When multiple files from different buckets are deleted, the trigger should delete them from storage and not delete other files or buckets", async () => {});
        it.skip("when more than 10 files are deleted, the storage delete should be processed up to 5 seconds after the last file is deleted", async () => {});
        // .. Add more and implement the tests

    });
});
    
