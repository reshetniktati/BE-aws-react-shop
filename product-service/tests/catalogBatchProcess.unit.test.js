import AWS from "aws-sdk";
import AWSMock from "aws-sdk-mock";
import { catalogBatchProcess } from "./handler.mjs";

AWSMock.setSDKInstance(AWS);

describe("catalogBatchProcess Lambda Function", () => {
  beforeAll(() => {
    AWSMock.mock("SNS", "publish", (params, callback) => {
      callback(null, { MessageId: "12345" });
    });
  });

  afterAll(() => {
    AWSMock.restore("SNS");
  });

  it("should process products and publish messages to SNS", async () => {
    const event = {
      Records: [
        { body: JSON.stringify({ id: "1", title: "Product 1" }) },
        { body: JSON.stringify({ id: "2", title: "Product 2" }) },
      ],
    };

    await catalogBatchProcess(event);
    const publishCalls = AWSMock.mocked("SNS", "publish").mock.calls;
    expect(publishCalls.length).toBe(2);
    expect(publishCalls[0][0].Message).toContain("Product 1");
    expect(publishCalls[1][0].Message).toContain("Product 2");
  });

  it("should handle errors if SNS publish fails", async () => {
    AWSMock.remock("SNS", "publish", (params, callback) => {
      callback(new Error("Failed to publish message"));
    });

    const event = {
      Records: [{ body: JSON.stringify({ id: "1", title: "Product 1" }) }],
    };

    await expect(catalogBatchProcess(event)).rejects.toThrow(
      "Failed to publish message"
    );
  });
});
