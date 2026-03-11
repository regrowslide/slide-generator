
  export const prismaDMMF = {
  "enums": [],
  "models": [
    {
      "name": "KaizenClient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "organization",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "iconUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bannerUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "website",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "public",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "introductionRequestedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWork",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWork",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenWork",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenReview",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenReview",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenReview",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "name",
          "organization"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_name_organization",
          "fields": [
            "name",
            "organization"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KaizenReview",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "username",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "review",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "platform",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenClient",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenClient",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenReview",
          "relationFromFields": [
            "kaizenClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KaizenWork",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "uuid",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "subtitle",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "beforeChallenge",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantitativeResult",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "points",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "clientName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "organization",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "companyScale",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dealPoint",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "toolPoint",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "impression",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reply",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "jobCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "systemCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "collaborationTool",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "projectDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWorkImage",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWorkImage",
          "nativeType": null,
          "relationName": "KaizenWorkToKaizenWorkImage",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "showName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenClient",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenClient",
          "nativeType": null,
          "relationName": "KaizenClientToKaizenWork",
          "relationFromFields": [
            "kaizenClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "allowShowClient",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isPublic",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "correctionRequest",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "title",
          "subtitle"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "unique_title_subtitle",
          "fields": [
            "title",
            "subtitle"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KaizenWorkImage",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "url",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KaizenWork",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KaizenWork",
          "nativeType": null,
          "relationName": "KaizenWorkToKaizenWorkImage",
          "relationFromFields": [
            "kaizenWorkId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kaizenWorkId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KaizenCMS",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactPageMsg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "principlePageMsg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingStore",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Room",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingRoom",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CounselingStoreToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingSlotToCounselingStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingRoom",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingStore",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingClient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "furigana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "age",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingReservation",
          "nativeType": null,
          "relationName": "CounselingClientToCounselingReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingReservation",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "preferredDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "visitorType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "topics",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingClient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingClient",
          "nativeType": null,
          "relationName": "CounselingClientToCounselingReservation",
          "relationFromFields": [
            "counselingClientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingClientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingReservationToCounselingSlot",
          "relationFromFields": [
            "counselingSlotId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingSlotId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CounselingSlot",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingRoom",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingRoom",
          "nativeType": null,
          "relationName": "CounselingRoomToCounselingSlot",
          "relationFromFields": [
            "counselingRoomId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingRoomId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingSlotToCounselingStore",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "CounselingSlotToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingReservation",
          "nativeType": null,
          "relationName": "CounselingReservationToCounselingSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalClinic",
      "dbName": "dental_clinics",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "representative",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "qualifications",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalFacility",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalFacility",
          "nativeType": null,
          "relationName": "DentalClinicToDentalFacility",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "DentalClinicToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalVisitPlan",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalVisitPlan",
          "nativeType": null,
          "relationName": "DentalClinicToDentalVisitPlan",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalSavedDocument",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalSavedDocument",
          "nativeType": null,
          "relationName": "DentalClinicToDentalSavedDocument",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalFacility",
      "dbName": "dental_facilities",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "facilityType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalClinic",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalClinic",
          "nativeType": null,
          "relationName": "DentalClinicToDentalFacility",
          "relationFromFields": [
            "dentalClinicId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalClinicId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalPatient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalPatient",
          "nativeType": null,
          "relationName": "DentalFacilityToDentalPatient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalVisitPlan",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalVisitPlan",
          "nativeType": null,
          "relationName": "DentalFacilityToDentalVisitPlan",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalPatient",
      "dbName": "dental_patients",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lastName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "firstName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lastNameKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "firstNameKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "birthDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "careLevel",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "building",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "floor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "room",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "diseases",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "teethCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hasDenture",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hasOralHypofunction",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assessment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalFacility",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalFacility",
          "nativeType": null,
          "relationName": "DentalFacilityToDentalPatient",
          "relationFromFields": [
            "dentalFacilityId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalFacilityId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExamination",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalPatient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalScoringHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalScoringHistory",
          "nativeType": null,
          "relationName": "DentalPatientToDentalScoringHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalSavedDocument",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalSavedDocument",
          "nativeType": null,
          "relationName": "DentalPatientToDentalSavedDocument",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalVisitPlan",
      "dbName": "dental_visit_plans",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "visitDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "default": "scheduled",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalClinic",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalClinic",
          "nativeType": null,
          "relationName": "DentalClinicToDentalVisitPlan",
          "relationFromFields": [
            "dentalClinicId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalClinicId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalFacility",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalFacility",
          "nativeType": null,
          "relationName": "DentalFacilityToDentalVisitPlan",
          "relationFromFields": [
            "dentalFacilityId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalFacilityId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExamination",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalVisitPlan",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalExamination",
      "dbName": "dental_examinations",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "default": "waiting",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vitalBefore",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vitalAfter",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "treatmentItems",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "procedureItems",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "visitCondition",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oralFindings",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "treatment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nextPlan",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "drStartTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "drEndTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dhStartTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dhEndTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "treatmentPerformed",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oralFunctionRecord",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalVisitPlan",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalVisitPlan",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalVisitPlan",
          "relationFromFields": [
            "dentalVisitPlanId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalVisitPlanId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalPatient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalPatient",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalPatient",
          "relationFromFields": [
            "dentalPatientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalPatientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Doctor",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "ExaminationDoctor",
          "relationFromFields": [
            "doctorId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "doctorId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Hygienist",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "ExaminationHygienist",
          "relationFromFields": [
            "hygienistId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hygienistId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalSavedDocument",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalSavedDocument",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalSavedDocument",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalTimerHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalTimerHistory",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalTimerHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalTimerHistory",
      "dbName": "dental_timer_histories",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "timerType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actionType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "previousValue",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newValue",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExamination",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalTimerHistory",
          "relationFromFields": [
            "dentalExaminationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalExaminationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalScoringHistory",
      "dbName": "dental_scoring_histories",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "procedureId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lastScoredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "points",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalPatient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalPatient",
          "nativeType": null,
          "relationName": "DentalPatientToDentalScoringHistory",
          "relationFromFields": [
            "dentalPatientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalPatientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DentalSavedDocument",
      "dbName": "dental_saved_documents",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "templateId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "templateName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "templateData",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pdfUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "version",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 1,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "downloadedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalClinic",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalClinic",
          "nativeType": null,
          "relationName": "DentalClinicToDentalSavedDocument",
          "relationFromFields": [
            "dentalClinicId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalClinicId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalPatient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalPatient",
          "nativeType": null,
          "relationName": "DentalPatientToDentalSavedDocument",
          "relationFromFields": [
            "dentalPatientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalPatientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExamination",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "DentalExaminationToDentalSavedDocument",
          "relationFromFields": [
            "dentalExaminationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalExaminationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GyoseiSession",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "uuid",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "draft",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "grantStatus",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adoptionDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "grantDecisionDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "analysisResult",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "GyoseiFile",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "GyoseiFile",
          "nativeType": null,
          "relationName": "GyoseiFileToGyoseiSession",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GyoseiFile",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "blobUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "GyoseiSession",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "GyoseiSession",
          "nativeType": null,
          "relationName": "GyoseiFileToGyoseiSession",
          "relationFromFields": [
            "gyoseiSessionId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gyoseiSessionId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgFacilityMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "CSV",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgOrder",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgOrder",
          "nativeType": null,
          "relationName": "KgFacilityMasterToKgOrder",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgDietTypeMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "colorClass",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgOrderLine",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgOrderLine",
          "nativeType": null,
          "relationName": "KgDietTypeMasterToKgOrderLine",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgProductionItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgProductionItem",
          "nativeType": null,
          "relationName": "KgDietTypeMasterToKgProductionItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgDailyMenu",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "menuDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": [
            "Date",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalVegetableG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pfc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMealSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMealSlot",
          "nativeType": null,
          "relationName": "KgDailyMenuToKgMealSlot",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgMealSlot",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dailyMenuId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mealType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mealTypeName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalEnergy",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalProtein",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalFat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalCarb",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalSodium",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalSalt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalVegetableG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgDailyMenu",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgDailyMenu",
          "nativeType": null,
          "relationName": "KgDailyMenuToKgMealSlot",
          "relationFromFields": [
            "dailyMenuId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMenuRecipe",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "KgMealSlotToKgMenuRecipe",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "dailyMenuId",
          "mealType"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "dailyMenuId",
            "mealType"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KgMenuRecipe",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mealSlotId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "parentRecipeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unitWeight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "g",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalEnergy",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalProtein",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalFat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalCarb",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalSodium",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalSalt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalVegetableG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMealSlot",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMealSlot",
          "nativeType": null,
          "relationName": "KgMealSlotToKgMenuRecipe",
          "relationFromFields": [
            "mealSlotId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ParentRecipe",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "RecipeHierarchy",
          "relationFromFields": [
            "parentRecipeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ChildRecipes",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "RecipeHierarchy",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgRecipeIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgRecipeIngredient",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgRecipeIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgOrderLine",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgOrderLine",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgOrderLine",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgProductionItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgProductionItem",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgProductionItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgRecipeIngredient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "menuRecipeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amountPerServing",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "g",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "energy",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "protein",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carb",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sodium",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "salt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "vegetableG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMenuRecipe",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgRecipeIngredient",
          "relationFromFields": [
            "menuRecipeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcIngredientMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcIngredientMaster",
          "nativeType": null,
          "relationName": "KgRecipeIngredientToRcIngredientMaster",
          "relationFromFields": [
            "ingredientMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgOrder",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "facilityId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": [
            "Date",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": [
            "Date",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "pending",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sourceType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "CSV",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ocrImageUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgFacilityMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgFacilityMaster",
          "nativeType": null,
          "relationName": "KgFacilityMasterToKgOrder",
          "relationFromFields": [
            "facilityId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgOrderLine",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgOrderLine",
          "nativeType": null,
          "relationName": "KgOrderToKgOrderLine",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgOrderLine",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mealType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dietTypeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "menuRecipeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rawName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "alert",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "pending",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "confirmedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgOrder",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgOrder",
          "nativeType": null,
          "relationName": "KgOrderToKgOrderLine",
          "relationFromFields": [
            "orderId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgDietTypeMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgDietTypeMaster",
          "nativeType": null,
          "relationName": "KgDietTypeMasterToKgOrderLine",
          "relationFromFields": [
            "dietTypeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMenuRecipe",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgOrderLine",
          "relationFromFields": [
            "menuRecipeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgProductionBatch",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": [
            "Date",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mealType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "planned",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgProductionItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgProductionItem",
          "nativeType": null,
          "relationName": "KgProductionBatchToKgProductionItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgRequiredIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgRequiredIngredient",
          "nativeType": null,
          "relationName": "KgProductionBatchToKgRequiredIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "productionDate",
          "mealType"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "productionDate",
            "mealType"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KgProductionItem",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionBatchId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "menuRecipeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dietTypeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalQuantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedQuantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "pending",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgProductionBatch",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgProductionBatch",
          "nativeType": null,
          "relationName": "KgProductionBatchToKgProductionItem",
          "relationFromFields": [
            "productionBatchId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgMenuRecipe",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgMenuRecipe",
          "nativeType": null,
          "relationName": "KgMenuRecipeToKgProductionItem",
          "relationFromFields": [
            "menuRecipeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgDietTypeMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgDietTypeMaster",
          "nativeType": null,
          "relationName": "KgDietTypeMasterToKgProductionItem",
          "relationFromFields": [
            "dietTypeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KgRequiredIngredient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionBatchId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedCost",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgProductionBatch",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgProductionBatch",
          "nativeType": null,
          "relationName": "KgProductionBatchToKgRequiredIngredient",
          "relationFromFields": [
            "productionBatchId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcIngredientMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcIngredientMaster",
          "nativeType": null,
          "relationName": "KgRequiredIngredientToRcIngredientMaster",
          "relationFromFields": [
            "ingredientMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KidsChild",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emoji",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "👶",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "KidsChildUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsCategory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsCategory",
          "nativeType": null,
          "relationName": "KidsCategoryToKidsChild",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsRoutineLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsRoutineLog",
          "nativeType": null,
          "relationName": "KidsChildToKidsRoutineLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsAchievement",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsAchievement",
          "nativeType": null,
          "relationName": "KidsAchievementToKidsChild",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsStreak",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsStreak",
          "nativeType": null,
          "relationName": "KidsChildToKidsStreak",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KidsCategory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emoji",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isArchived",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "childId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsChild",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsChild",
          "nativeType": null,
          "relationName": "KidsCategoryToKidsChild",
          "relationFromFields": [
            "childId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsRoutine",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsRoutine",
          "nativeType": null,
          "relationName": "KidsCategoryToKidsRoutine",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KidsRoutine",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emoji",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sticker",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isArchived",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "categoryId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsCategory",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsCategory",
          "nativeType": null,
          "relationName": "KidsCategoryToKidsRoutine",
          "relationFromFields": [
            "categoryId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsRoutineLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsRoutineLog",
          "nativeType": null,
          "relationName": "KidsRoutineToKidsRoutineLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KidsRoutineLog",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "routineId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "childId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsRoutine",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsRoutine",
          "nativeType": null,
          "relationName": "KidsRoutineToKidsRoutineLog",
          "relationFromFields": [
            "routineId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsChild",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsChild",
          "nativeType": null,
          "relationName": "KidsChildToKidsRoutineLog",
          "relationFromFields": [
            "childId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "routineId",
          "childId",
          "date"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "routineId",
            "childId",
            "date"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "KidsAchievement",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "childId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sticker",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsChild",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsChild",
          "nativeType": null,
          "relationName": "KidsAchievementToKidsChild",
          "relationFromFields": [
            "childId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "KidsStreak",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "childId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "currentStreak",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "longestStreak",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lastCompletedDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsChild",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsChild",
          "nativeType": null,
          "relationName": "KidsChildToKidsStreak",
          "relationFromFields": [
            "childId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Product",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionCapacity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "allowanceStock",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProductRecipe",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProductRecipe",
          "nativeType": null,
          "relationName": "ProductToProductRecipe",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Order",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Order",
          "nativeType": null,
          "relationName": "OrderToProduct",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Production",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Production",
          "nativeType": null,
          "relationName": "ProductToProduction",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Shipment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Shipment",
          "nativeType": null,
          "relationName": "ProductToShipment",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DailyStaffAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DailyStaffAssignment",
          "nativeType": null,
          "relationName": "DailyStaffAssignmentToProduct",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RawMaterial",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "safetyStock",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ProductRecipe",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ProductRecipe",
          "nativeType": null,
          "relationName": "ProductRecipeToRawMaterial",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "StockAdjustment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "StockAdjustment",
          "nativeType": null,
          "relationName": "RawMaterialToStockAdjustment",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ProductRecipe",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rawMaterialId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToProductRecipe",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RawMaterial",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RawMaterial",
          "nativeType": null,
          "relationName": "ProductRecipeToRawMaterial",
          "relationFromFields": [
            "rawMaterialId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "productId",
          "rawMaterialId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "product_rawMaterial_unique",
          "fields": [
            "productId",
            "rawMaterialId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Order",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "OrderToProduct",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Production",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToProduction",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Shipment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shipmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shipmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "ProductToShipment",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "StockAdjustment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rawMaterialId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "adjustmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reason",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RawMaterial",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RawMaterial",
          "nativeType": null,
          "relationName": "RawMaterialToStockAdjustment",
          "relationFromFields": [
            "rawMaterialId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CompanyHoliday",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "休日",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "note",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "DailyStaffAssignment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assignmentAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "staffCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 3,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Product",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Product",
          "nativeType": null,
          "relationName": "DailyStaffAssignmentToProduct",
          "relationFromFields": [
            "productId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "assignmentAt",
          "productId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "assignment_product_unique",
          "fields": [
            "assignmentAt",
            "productId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "RcIngredientMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "price",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yield",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "supplier",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "standardCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "energyPer100g",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "proteinPer100g",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fatPer100g",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "carbPer100g",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sodiumPer100g",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcRecipeIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcRecipeIngredient",
          "nativeType": null,
          "relationName": "RcIngredientMasterToRcRecipeIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgRecipeIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgRecipeIngredient",
          "nativeType": null,
          "relationName": "KgRecipeIngredientToRcIngredientMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KgRequiredIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KgRequiredIngredient",
          "nativeType": null,
          "relationName": "KgRequiredIngredientToRcIngredientMaster",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RcRecipe",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "draft",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lossRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 5,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "packWeightG",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 200,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "packagingCost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 30,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "processingCost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 50,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "profitMargin",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 200,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "otherCost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionWeightG",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "inputMode",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "fillAmount",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalMaterialCost",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalWeightKg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productionWeightKg",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "packCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "materialCostPerPack",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalCostPerPack",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sellingPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sourceType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sourceFileName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sourceFileUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcRecipeIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcRecipeIngredient",
          "nativeType": null,
          "relationName": "RcRecipeToRcRecipeIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RcRecipeIngredient",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recipeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcRecipe",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcRecipe",
          "nativeType": null,
          "relationName": "RcRecipeToRcRecipeIngredient",
          "relationFromFields": [
            "recipeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ingredientMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RcIngredientMaster",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RcIngredientMaster",
          "nativeType": null,
          "relationName": "RcIngredientMasterToRcRecipeIngredient",
          "relationFromFields": [
            "ingredientMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "originalName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "amount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "weightKg",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pricePerKg",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yieldRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 100,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isExternal",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "source",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "手動入力",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "done",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "matchReason",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalProductName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalProductUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalWeight",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "externalWeightText",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RcCategoryYieldMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "categoryName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yieldRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isFallback",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RcProfitMarginStandard",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "minPackCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "maxPackCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "minProfitAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "minProfitRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RgStore",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fullName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgUserList",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RgUserStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStoreKpi",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStoreKpi",
          "nativeType": null,
          "relationName": "RgStoreToRgStoreKpi",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStoreTotals",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStoreTotals",
          "nativeType": null,
          "relationName": "RgStoreToRgStoreTotals",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffRecord",
          "nativeType": null,
          "relationName": "RgStaffRecordToRgStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffManualData",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffManualData",
          "nativeType": null,
          "relationName": "RgStaffManualDataToRgStore",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RgMonthlyReport",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yearMonth",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "importedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "importedFileName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffRecord",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStaffRecord",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStoreTotals",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStoreTotals",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStoreTotals",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStoreKpi",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStoreKpi",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStoreKpi",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffManualData",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffManualData",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStaffManualData",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgCustomerVoice",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgCustomerVoice",
          "nativeType": null,
          "relationName": "RgCustomerVoiceToRgMonthlyReport",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yearMonth"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "yearMonth"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "RgStaffRecord",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "monthlyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "staffName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rank",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sales",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newCustomerCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nominationCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unitPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgMonthlyReport",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgMonthlyReport",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStaffRecord",
          "relationFromFields": [
            "monthlyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RgStaffRecordUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStore",
          "nativeType": null,
          "relationName": "RgStaffRecordToRgStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RgStoreTotals",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "monthlyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sales",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nominationCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unitPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgMonthlyReport",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgMonthlyReport",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStoreTotals",
          "relationFromFields": [
            "monthlyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStore",
          "nativeType": null,
          "relationName": "RgStoreToRgStoreTotals",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RgStoreKpi",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "monthlyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "utilizationRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "returnRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "csRegistrationCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "comment",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgMonthlyReport",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgMonthlyReport",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStoreKpi",
          "relationFromFields": [
            "monthlyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStore",
          "nativeType": null,
          "relationName": "RgStoreToRgStoreKpi",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "monthlyReportId",
          "storeId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "monthlyReportId",
            "storeId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "RgStaffManualData",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "monthlyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "staffName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "utilizationRate",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "csRegistrationCount",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "targetSales",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgMonthlyReport",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgMonthlyReport",
          "nativeType": null,
          "relationName": "RgMonthlyReportToRgStaffManualData",
          "relationFromFields": [
            "monthlyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "RgStaffManualDataUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStore",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStore",
          "nativeType": null,
          "relationName": "RgStaffManualDataToRgStore",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "monthlyReportId",
          "staffName",
          "storeId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "monthlyReportId",
            "staffName",
            "storeId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "RgCustomerVoice",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "monthlyReportId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "content",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgMonthlyReport",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgMonthlyReport",
          "nativeType": null,
          "relationName": "RgCustomerVoiceToRgMonthlyReport",
          "relationFromFields": [
            "monthlyReportId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "monthlyReportId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "monthlyReportId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmCustomer",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "companyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "postalCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "city",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "street",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "building",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "255"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "availablePoints",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmCustomerPhone",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomerPhone",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmCustomerPhone",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmCustomerPhone",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "label",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phoneNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomer",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmCustomerPhone",
          "relationFromFields": [
            "sbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmCustomerId",
          "phoneNumber"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmCustomerId",
            "phoneNumber"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmProduct",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProductPriceHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductPriceHistory",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductPriceHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationItem",
          "nativeType": null,
          "relationName": "SbmProductToSbmReservationItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProductIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductIngredient",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmProductPriceHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "price",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cost",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "effectiveDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductPriceHistory",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryGroup",
      "dbName": "sbm_delivery_groups",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "planning",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalReservations",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedReservations",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "routeUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "optimizedRoute",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryRouteStop",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryRouteStop",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "groupReservations",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroupReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryGroupReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryRouteStop",
      "dbName": "sbm_delivery_route_stops",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "uuid",
            "args": [
              4
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lat",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lng",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedArrival",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualArrival",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroup",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryRouteStop",
          "relationFromFields": [
            "sbmDeliveryGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryRouteStopToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryGroupReservation",
      "dbName": "sbm_delivery_group_reservations",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryGroupId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryGroup",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroup",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupToSbmDeliveryGroupReservation",
          "relationFromFields": [
            "sbmDeliveryGroupId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupReservationToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmDeliveryGroupId",
          "sbmReservationId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmDeliveryGroupId",
            "sbmReservationId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "SbmReservation",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isCanceled",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "canceledAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cancelReason",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryRouteStops",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryRouteStop",
          "nativeType": null,
          "relationName": "SbmDeliveryRouteStopToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryGroupReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryGroupReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryGroupReservationToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmCustomerId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "customerName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "contactName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phoneNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "postalCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prefecture",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "city",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "street",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "building",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pickupLocation",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "purpose",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "paymentMethod",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderChannel",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "pointsUsed",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "finalAmount",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "orderStaff",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recoveryCompleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmCustomer",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmCustomer",
          "nativeType": null,
          "relationName": "SbmCustomerToSbmReservation",
          "relationFromFields": [
            "sbmCustomerId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmReservationToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationItem",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationItem",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationItem",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationChangeHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationChangeHistory",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationChangeHistory",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmReservation",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmReservationItem",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "productName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unitPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalPrice",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationItem",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmReservationItem",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmReservationChangeHistory",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": {
            "name": "cuid",
            "args": [
              1
            ]
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changeType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changedFields",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "oldValues",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "newValues",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "changedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToSbmReservationChangeHistory",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmReservationChangeHistoryToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryTeam",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmDeliveryTeam",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmDeliveryAssignment",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmDeliveryTeamId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmReservationId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "assignedBy",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deliveryDate",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "estimatedDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualDuration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "route",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Json",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "default": "assigned",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmDeliveryTeam",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryTeam",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmDeliveryTeam",
          "relationFromFields": [
            "sbmDeliveryTeamId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToSbmReservation",
          "relationFromFields": [
            "sbmReservationId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "SetNull",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmIngredient",
      "dbName": "sbm_ingredients",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProductIngredient",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProductIngredient",
          "nativeType": null,
          "relationName": "SbmIngredientToSbmProductIngredient",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "SbmProductIngredient",
      "dbName": "sbm_product_ingredients",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmProductId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sbmIngredientId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Float",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "SbmProduct",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmProduct",
          "nativeType": null,
          "relationName": "SbmProductToSbmProductIngredient",
          "relationFromFields": [
            "sbmProductId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmIngredient",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmIngredient",
          "nativeType": null,
          "relationName": "SbmIngredientToSbmProductIngredient",
          "relationFromFields": [
            "sbmIngredientId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Restrict",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "sbmProductId",
          "sbmIngredientId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "sbmProductId",
            "sbmIngredientId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "Department",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "DepartmentToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Store",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "tel",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fax",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "StoreToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "User",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "active",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "hiredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "retiredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "transferredAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yukyuCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "A",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "password",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "999999",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "role",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "user",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tempResetCodeExpired",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schoolId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rentaStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "type2",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "shopId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "membershipName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "damageNameMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "app",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "employeeCode",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "avatar",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bcc",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservation",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservation",
          "nativeType": null,
          "relationName": "SbmReservationToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmDeliveryAssignment",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmDeliveryAssignment",
          "nativeType": null,
          "relationName": "SbmDeliveryAssignmentToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExerciseMaster",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExerciseMaster",
          "nativeType": null,
          "relationName": "ExerciseMasterToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "WorkoutLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "WorkoutLog",
          "nativeType": null,
          "relationName": "UserToWorkoutLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SbmReservationChangeHistory",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "SbmReservationChangeHistory",
          "nativeType": null,
          "relationName": "SbmReservationChangeHistoryToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingStore",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingStore",
          "nativeType": null,
          "relationName": "CounselingStoreToUser",
          "relationFromFields": [
            "counselingStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "counselingStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CounselingSlot",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "CounselingSlot",
          "nativeType": null,
          "relationName": "CounselingSlotToUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Store",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Store",
          "nativeType": null,
          "relationName": "StoreToUser",
          "relationFromFields": [
            "storeId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "storeId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventAsCL",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEventCL",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventAsSL",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEventSL",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiAttendance",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiAttendance",
          "nativeType": null,
          "relationName": "UserToYamanokaiAttendance",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiAttendanceAsApprover",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiAttendance",
          "nativeType": null,
          "relationName": "AttendanceApprover",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "department",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Department",
          "nativeType": null,
          "relationName": "DepartmentToUser",
          "relationFromFields": [
            "departmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "departmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalClinic",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalClinic",
          "nativeType": null,
          "relationName": "DentalClinicToUser",
          "relationFromFields": [
            "dentalClinicId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dentalClinicId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExaminationDoctor",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "ExaminationDoctor",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "DentalExaminationHygienist",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DentalExamination",
          "nativeType": null,
          "relationName": "ExaminationHygienist",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "lineUserId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisEventCreator",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisEvent",
          "nativeType": null,
          "relationName": "TennisEventCreator",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisAttendance",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisAttendance",
          "nativeType": null,
          "relationName": "TennisAttendanceUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rgStoreId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStoreRg",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStore",
          "nativeType": null,
          "relationName": "RgUserStore",
          "relationFromFields": [
            "rgStoreId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffRecordUser",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffRecord",
          "nativeType": null,
          "relationName": "RgStaffRecordUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RgStaffManualDataUser",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RgStaffManualData",
          "nativeType": null,
          "relationName": "RgStaffManualDataUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "KidsChildUser",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "KidsChild",
          "nativeType": null,
          "relationName": "KidsChildUser",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "ReleaseNotes",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rootPath",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "msg",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "imgUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "confirmedUserIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Tokens",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "token",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiresAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "GoogleAccessToken",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "access_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "refresh_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "scope",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "token_type",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "id_token",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiry_date",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tokenJSON",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "RoleMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "apps",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "UserRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "UserRole",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "UserRole",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToUserRole",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "RoleMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "RoleMaster",
          "nativeType": null,
          "relationName": "RoleMasterToUserRole",
          "relationFromFields": [
            "roleMasterId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "roleMasterId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "userId",
          "roleMasterId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": "userId_roleMasterId_unique",
          "fields": [
            "userId",
            "roleMasterId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ChainMethodLock",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isLocked",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "expiresAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "Calendar",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "holidayType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": null,
          "default": "出勤",
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "CronExecutionLog",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "batchId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "batchName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "duration",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "errorMessage",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "result",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TennisCourt",
      "dbName": "tennis_courts",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "googleMapsUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "courtNumbers",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "schedulePageKey",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisEventCourt",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisEventCourt",
          "nativeType": null,
          "relationName": "TennisCourtToTennisEventCourt",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TennisEvent",
      "dbName": "tennis_events",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "5"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "5"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "memo",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "Creator",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TennisEventCreator",
          "relationFromFields": [
            "creatorId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "creatorId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisEventCourt",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisEventCourt",
          "nativeType": null,
          "relationName": "TennisEventToTennisEventCourt",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisAttendance",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisAttendance",
          "nativeType": null,
          "relationName": "TennisAttendanceToTennisEvent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "TennisEventCourt",
      "dbName": "tennis_event_courts",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "courtNumber",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "planned",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisEvent",
          "nativeType": null,
          "relationName": "TennisEventToTennisEventCourt",
          "relationFromFields": [
            "tennisEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tennisEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisCourt",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisCourt",
          "nativeType": null,
          "relationName": "TennisCourtToTennisEventCourt",
          "relationFromFields": [
            "tennisCourtId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tennisCourtId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tennisEventId",
          "tennisCourtId",
          "courtNumber"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "tennisEventId",
            "tennisCourtId",
            "courtNumber"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "TennisAttendance",
      "dbName": "tennis_attendances",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "comment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "TennisEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "TennisEvent",
          "nativeType": null,
          "relationName": "TennisAttendanceToTennisEvent",
          "relationFromFields": [
            "tennisEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "tennisEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "TennisAttendanceUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "tennisEventId",
          "userId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "tennisEventId",
            "userId"
          ]
        }
      ],
      "isGenerated": false
    },
    {
      "name": "ExerciseMaster",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "part",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "unit",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "ExerciseMasterToUser",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "WorkoutLog",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "WorkoutLog",
          "nativeType": null,
          "relationName": "ExerciseMasterToWorkoutLog",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "WorkoutLog",
      "dbName": null,
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "exerciseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "date",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "strength",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "reps",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToWorkoutLog",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ExerciseMaster",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "ExerciseMaster",
          "nativeType": null,
          "relationName": "ExerciseMasterToWorkoutLog",
          "relationFromFields": [
            "exerciseId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false
    },
    {
      "name": "YamanokaiDepartment",
      "dbName": "yamanokai_departments",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "color",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bgColor",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiMember",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiEvent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourse",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourse",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiDepartment",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMemberRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMemberRole",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiMemberRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "部署マスター（ハイキング部、山行部、教育部、自然保護部、組織部）"
    },
    {
      "name": "YamanokaiRole",
      "dbName": "yamanokai_roles",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "level",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "permissions",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMemberRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMemberRole",
          "nativeType": null,
          "relationName": "YamanokaiMemberRoleToYamanokaiRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "役職マスター（三役、事務局、専門部長、CL、SL、一般会員）"
    },
    {
      "name": "YamanokaiCourse",
      "dbName": "yamanokai_courses",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "prerequisiteIds",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiDepartment",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiDepartment",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiDepartment",
          "relationFromFields": [
            "yamanokaiDepartmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiDepartmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourseCompletion",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourseCompletion",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiCourseCompletion",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventRequiredCourse",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventRequiredCourse",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiEventRequiredCourse",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "講座マスター（岩座学、雪山ハイキング講座 etc.）"
    },
    {
      "name": "YamanokaiEquipment",
      "dbName": "yamanokai_equipment",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "category",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "totalQuantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEquipmentLoan",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEquipmentLoan",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentToYamanokaiEquipmentLoan",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "装備マスター"
    },
    {
      "name": "YamanokaiInsuranceGrade",
      "dbName": "yamanokai_insurance_grades",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "kuchi",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "eligibleActivities",
          "kind": "scalar",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "保険口数マスター"
    },
    {
      "name": "YamanokaiStaminaGrade",
      "dbName": "yamanokai_stamina_grades",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "体力度グレードマスター"
    },
    {
      "name": "YamanokaiSkillGrade",
      "dbName": "yamanokai_skill_grades",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "技術度グレードマスター"
    },
    {
      "name": "YamanokaiRockCategory",
      "dbName": "yamanokai_rock_categories",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "code",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "岩登り区分マスター"
    },
    {
      "name": "YamanokaiMember",
      "dbName": "yamanokai_members",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "nameKana",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "email",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": true,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "255"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "birthday",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bloodType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insuranceKuchi",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 3,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cocoHeliId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "medicalHistory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyPhone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyRelation",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "joinedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isAdmin",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isActive",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": true,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiDepartment",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiDepartment",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiMember",
          "relationFromFields": [
            "yamanokaiDepartmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiDepartmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRole",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRole",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiRole",
          "relationFromFields": [
            "yamanokaiRoleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiRoleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMemberRole",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMemberRole",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiMemberRole",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourseCompletion",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourseCompletion",
          "nativeType": null,
          "relationName": "YamanokaiCourseCompletionToYamanokaiMember",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEquipmentLoan",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEquipmentLoan",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentLoanToYamanokaiMember",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRecord",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRecord",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiRecord",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventPlanApprover",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventPlan",
          "nativeType": null,
          "relationName": "EventPlanApprover",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventPlanParticipant",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventPlanParticipant",
          "nativeType": null,
          "relationName": "YamanokaiEventPlanParticipantToYamanokaiMember",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "会員"
    },
    {
      "name": "YamanokaiMemberRole",
      "dbName": "yamanokai_member_roles",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiMemberRole",
          "relationFromFields": [
            "yamanokaiMemberId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiMemberId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRole",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRole",
          "nativeType": null,
          "relationName": "YamanokaiMemberRoleToYamanokaiRole",
          "relationFromFields": [
            "yamanokaiRoleId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiRoleId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiDepartment",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiDepartment",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiMemberRole",
          "relationFromFields": [
            "yamanokaiDepartmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiDepartmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "会員役職履歴"
    },
    {
      "name": "YamanokaiCourseCompletion",
      "dbName": "yamanokai_course_completions",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "completedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiCourseCompletionToYamanokaiMember",
          "relationFromFields": [
            "yamanokaiMemberId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiMemberId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourse",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourse",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiCourseCompletion",
          "relationFromFields": [
            "yamanokaiCourseId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiCourseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiCourseCompletionToYamanokaiEvent",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yamanokaiMemberId",
          "yamanokaiCourseId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "yamanokaiMemberId",
            "yamanokaiCourseId"
          ]
        }
      ],
      "isGenerated": false,
      "documentation": "講座受講履歴"
    },
    {
      "name": "YamanokaiEvent",
      "dbName": "yamanokai_events",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mountainName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "altitude",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "startAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "endAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "deadline",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "staminaGrade",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "skillGrade",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rockCategory",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "requiredInsurance",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 3,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "meetingPlace",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "meetingTime",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "course",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "capacity",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "draft",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiDepartment",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiDepartment",
          "nativeType": null,
          "relationName": "YamanokaiDepartmentToYamanokaiEvent",
          "relationFromFields": [
            "yamanokaiDepartmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiDepartmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "CL",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "YamanokaiEventCL",
          "relationFromFields": [
            "clId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "clId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "SL",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "YamanokaiEventSL",
          "relationFromFields": [
            "slId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "slId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiAttendance",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiAttendance",
          "nativeType": null,
          "relationName": "YamanokaiAttendanceToYamanokaiEvent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventPlan",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventPlan",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiEventPlan",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRecord",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRecord",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiRecord",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourseCompletion",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourseCompletion",
          "nativeType": null,
          "relationName": "YamanokaiCourseCompletionToYamanokaiEvent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEquipmentLoan",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEquipmentLoan",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentLoanToYamanokaiEvent",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventRequiredCourse",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventRequiredCourse",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiEventRequiredCourse",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "例会"
    },
    {
      "name": "YamanokaiEventRequiredCourse",
      "dbName": "yamanokai_event_required_courses",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiEventRequiredCourse",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiCourse",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiCourse",
          "nativeType": null,
          "relationName": "YamanokaiCourseToYamanokaiEventRequiredCourse",
          "relationFromFields": [
            "yamanokaiCourseId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiCourseId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yamanokaiEventId",
          "yamanokaiCourseId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "yamanokaiEventId",
            "yamanokaiCourseId"
          ]
        }
      ],
      "isGenerated": false,
      "documentation": "例会の必須講座（中間テーブル）"
    },
    {
      "name": "YamanokaiEventPlan",
      "dbName": "yamanokai_event_plans",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "detailedCourse",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "escapeRoute",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyPlan",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "equipmentList",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "draft",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "submittedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiEventPlan",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiApprover",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "EventPlanApprover",
          "relationFromFields": [
            "approvedBy"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvedBy",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventPlanParticipant",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventPlanParticipant",
          "nativeType": null,
          "relationName": "YamanokaiEventPlanToYamanokaiEventPlanParticipant",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "山行計画書"
    },
    {
      "name": "YamanokaiEventPlanParticipant",
      "dbName": "yamanokai_event_plan_participants",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "role",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "name",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "birthday",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "gender",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "insuranceKuchi",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "bloodType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "10"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "address",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "phone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyName",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyPhone",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "emergencyRelation",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "medicalHistory",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "cocoHeliId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEventPlan",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEventPlan",
          "nativeType": null,
          "relationName": "YamanokaiEventPlanToYamanokaiEventPlanParticipant",
          "relationFromFields": [
            "yamanokaiEventPlanId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventPlanId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiEventPlanParticipantToYamanokaiMember",
          "relationFromFields": [
            "yamanokaiMemberId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiMemberId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yamanokaiEventPlanId",
          "yamanokaiMemberId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "yamanokaiEventPlanId",
            "yamanokaiMemberId"
          ]
        }
      ],
      "isGenerated": false,
      "documentation": "計画書参加者"
    },
    {
      "name": "YamanokaiAttendance",
      "dbName": "yamanokai_attendances",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "pending",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "comment",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "rejectionReason",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "actualAttended",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiAttendanceToYamanokaiEvent",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "User",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "UserToYamanokaiAttendance",
          "relationFromFields": [
            "userId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "userId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "ApprovedByUser",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "User",
          "nativeType": null,
          "relationName": "AttendanceApprover",
          "relationFromFields": [
            "approvedBy"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "approvedBy",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [
        [
          "yamanokaiEventId",
          "userId"
        ]
      ],
      "uniqueIndexes": [
        {
          "name": null,
          "fields": [
            "yamanokaiEventId",
            "userId"
          ]
        }
      ],
      "isGenerated": false,
      "documentation": "参加申請"
    },
    {
      "name": "YamanokaiRecord",
      "dbName": "yamanokai_records",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "title",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "recordedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "weather",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "50"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "participants",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "draft",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "submittedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "publishedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEventToYamanokaiRecord",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": true,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiAuthor",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiMemberToYamanokaiRecord",
          "relationFromFields": [
            "authorId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "authorId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRecordFile",
          "kind": "object",
          "isList": true,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRecordFile",
          "nativeType": null,
          "relationName": "YamanokaiRecordToYamanokaiRecordFile",
          "relationFromFields": [],
          "relationToFields": [],
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "例会記録"
    },
    {
      "name": "YamanokaiRecordFile",
      "dbName": "yamanokai_record_files",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileUrl",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileName",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "200"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileType",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "fileSize",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "mimeType",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "100"
            ]
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "description",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiRecord",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiRecord",
          "nativeType": null,
          "relationName": "YamanokaiRecordToYamanokaiRecordFile",
          "relationFromFields": [
            "yamanokaiRecordId"
          ],
          "relationToFields": [
            "id"
          ],
          "relationOnDelete": "Cascade",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiRecordId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "例会記録ファイル\n1つの例会記録に対して複数のファイル(PDF/Word)をアップロード可能"
    },
    {
      "name": "YamanokaiEquipmentLoan",
      "dbName": "yamanokai_equipment_loans",
      "schema": null,
      "fields": [
        {
          "name": "id",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": true,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": {
            "name": "autoincrement",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "createdAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "DateTime",
          "nativeType": null,
          "default": {
            "name": "now",
            "args": []
          },
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "updatedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": true
        },
        {
          "name": "sortOrder",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Float",
          "nativeType": null,
          "default": 0,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "quantity",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Int",
          "nativeType": null,
          "default": 1,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "loanAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "dueAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "returnedAt",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "DateTime",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "status",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "String",
          "nativeType": [
            "VarChar",
            [
              "20"
            ]
          ],
          "default": "loaned",
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "notes",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "String",
          "nativeType": [
            "Text",
            []
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "isDeleted",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": true,
          "type": "Boolean",
          "nativeType": null,
          "default": false,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEquipment",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEquipment",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentToYamanokaiEquipmentLoan",
          "relationFromFields": [
            "yamanokaiEquipmentId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEquipmentId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiMember",
          "kind": "object",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiMember",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentLoanToYamanokaiMember",
          "relationFromFields": [
            "yamanokaiMemberId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiMemberId",
          "kind": "scalar",
          "isList": false,
          "isRequired": true,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "YamanokaiEvent",
          "kind": "object",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": false,
          "hasDefaultValue": false,
          "type": "YamanokaiEvent",
          "nativeType": null,
          "relationName": "YamanokaiEquipmentLoanToYamanokaiEvent",
          "relationFromFields": [
            "yamanokaiEventId"
          ],
          "relationToFields": [
            "id"
          ],
          "isGenerated": false,
          "isUpdatedAt": false
        },
        {
          "name": "yamanokaiEventId",
          "kind": "scalar",
          "isList": false,
          "isRequired": false,
          "isUnique": false,
          "isId": false,
          "isReadOnly": true,
          "hasDefaultValue": false,
          "type": "Int",
          "nativeType": null,
          "isGenerated": false,
          "isUpdatedAt": false
        }
      ],
      "primaryKey": null,
      "uniqueFields": [],
      "uniqueIndexes": [],
      "isGenerated": false,
      "documentation": "装備貸出"
    }
  ],
  "types": [],
  "indexes": [
    {
      "model": "KaizenClient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenClient",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_name_organization",
      "fields": [
        {
          "name": "name"
        },
        {
          "name": "organization"
        }
      ]
    },
    {
      "model": "KaizenReview",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "uuid"
        }
      ]
    },
    {
      "model": "KaizenWork",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "unique_title_subtitle",
      "fields": [
        {
          "name": "title"
        },
        {
          "name": "subtitle"
        }
      ]
    },
    {
      "model": "KaizenWorkImage",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KaizenWorkImage",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "url"
        }
      ]
    },
    {
      "model": "KaizenCMS",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingStore",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingRoom",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingClient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingClient",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "phone"
        }
      ]
    },
    {
      "model": "CounselingReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CounselingSlot",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalClinic",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalFacility",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalPatient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalVisitPlan",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalExamination",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalTimerHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalScoringHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DentalSavedDocument",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GyoseiSession",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GyoseiSession",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "uuid"
        }
      ]
    },
    {
      "model": "GyoseiFile",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgFacilityMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgFacilityMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "KgDietTypeMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgDietTypeMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "KgDailyMenu",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgDailyMenu",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "menuDate"
        }
      ]
    },
    {
      "model": "KgMealSlot",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgMealSlot",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "dailyMenuId"
        },
        {
          "name": "mealType"
        }
      ]
    },
    {
      "model": "KgMenuRecipe",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgRecipeIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgOrder",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgOrderLine",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgProductionBatch",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgProductionBatch",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "productionDate"
        },
        {
          "name": "mealType"
        }
      ]
    },
    {
      "model": "KgProductionItem",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KgRequiredIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsChild",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsCategory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsRoutine",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsRoutineLog",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsRoutineLog",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "routineId"
        },
        {
          "name": "childId"
        },
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "KidsAchievement",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsStreak",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "KidsStreak",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "childId"
        }
      ]
    },
    {
      "model": "Product",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RawMaterial",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProductRecipe",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "ProductRecipe",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "product_rawMaterial_unique",
      "fields": [
        {
          "name": "productId"
        },
        {
          "name": "rawMaterialId"
        }
      ]
    },
    {
      "model": "Order",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Production",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Shipment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "StockAdjustment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CompanyHoliday",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CompanyHoliday",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "holidayAt"
        }
      ]
    },
    {
      "model": "DailyStaffAssignment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "DailyStaffAssignment",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "assignment_product_unique",
      "fields": [
        {
          "name": "assignmentAt"
        },
        {
          "name": "productId"
        }
      ]
    },
    {
      "model": "RcIngredientMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RcRecipe",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RcRecipeIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RcCategoryYieldMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RcCategoryYieldMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "categoryName"
        }
      ]
    },
    {
      "model": "RcProfitMarginStandard",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgStore",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgMonthlyReport",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgMonthlyReport",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "yearMonth"
        }
      ]
    },
    {
      "model": "RgStaffRecord",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgStoreTotals",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgStoreKpi",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgStoreKpi",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "monthlyReportId"
        },
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "RgStaffManualData",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgStaffManualData",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "monthlyReportId"
        },
        {
          "name": "staffName"
        },
        {
          "name": "storeId"
        }
      ]
    },
    {
      "model": "RgCustomerVoice",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RgCustomerVoice",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "monthlyReportId"
        }
      ]
    },
    {
      "model": "SbmCustomer",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmCustomerPhone",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmCustomerPhone",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmCustomerId"
        },
        {
          "name": "phoneNumber"
        }
      ]
    },
    {
      "model": "SbmProduct",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductPriceHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroup",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryRouteStop",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroupReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryGroupReservation",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmDeliveryGroupId"
        },
        {
          "name": "sbmReservationId"
        }
      ]
    },
    {
      "model": "SbmReservation",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmReservationItem",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmReservationChangeHistory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryTeam",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmDeliveryAssignment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductIngredient",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "SbmProductIngredient",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "sbmProductId"
        },
        {
          "name": "sbmIngredientId"
        }
      ]
    },
    {
      "model": "Department",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Department",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "Store",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Store",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "User",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "employeeCode"
        }
      ]
    },
    {
      "model": "User",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "lineUserId"
        }
      ]
    },
    {
      "model": "ReleaseNotes",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Tokens",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Tokens",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "GoogleAccessToken",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "RoleMaster",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "name"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "UserRole",
      "type": "unique",
      "isDefinedOnField": false,
      "name": "userId_roleMasterId_unique",
      "fields": [
        {
          "name": "userId"
        },
        {
          "name": "roleMasterId"
        }
      ]
    },
    {
      "model": "ChainMethodLock",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "Calendar",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "date"
        }
      ]
    },
    {
      "model": "CronExecutionLog",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "CronExecutionLog",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "batchId"
        }
      ]
    },
    {
      "model": "CronExecutionLog",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "startedAt"
        }
      ]
    },
    {
      "model": "CronExecutionLog",
      "type": "normal",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "status"
        }
      ]
    },
    {
      "model": "TennisCourt",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TennisEvent",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TennisEventCourt",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TennisEventCourt",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tennisEventId"
        },
        {
          "name": "tennisCourtId"
        },
        {
          "name": "courtNumber"
        }
      ]
    },
    {
      "model": "TennisAttendance",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "TennisAttendance",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "tennisEventId"
        },
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "ExerciseMaster",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "WorkoutLog",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiDepartment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiDepartment",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "YamanokaiRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiRole",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "YamanokaiCourse",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEquipment",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiInsuranceGrade",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiInsuranceGrade",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "kuchi"
        }
      ]
    },
    {
      "model": "YamanokaiStaminaGrade",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiStaminaGrade",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "YamanokaiSkillGrade",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiSkillGrade",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "YamanokaiRockCategory",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiRockCategory",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "code"
        }
      ]
    },
    {
      "model": "YamanokaiMember",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiMember",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "email"
        }
      ]
    },
    {
      "model": "YamanokaiMemberRole",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiCourseCompletion",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiCourseCompletion",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "yamanokaiMemberId"
        },
        {
          "name": "yamanokaiCourseId"
        }
      ]
    },
    {
      "model": "YamanokaiEvent",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEventRequiredCourse",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEventRequiredCourse",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "yamanokaiEventId"
        },
        {
          "name": "yamanokaiCourseId"
        }
      ]
    },
    {
      "model": "YamanokaiEventPlan",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEventPlan",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "yamanokaiEventId"
        }
      ]
    },
    {
      "model": "YamanokaiEventPlanParticipant",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEventPlanParticipant",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "yamanokaiEventPlanId"
        },
        {
          "name": "yamanokaiMemberId"
        }
      ]
    },
    {
      "model": "YamanokaiAttendance",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiAttendance",
      "type": "unique",
      "isDefinedOnField": false,
      "fields": [
        {
          "name": "yamanokaiEventId"
        },
        {
          "name": "userId"
        }
      ]
    },
    {
      "model": "YamanokaiRecord",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiRecord",
      "type": "unique",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "yamanokaiEventId"
        }
      ]
    },
    {
      "model": "YamanokaiRecordFile",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    },
    {
      "model": "YamanokaiEquipmentLoan",
      "type": "id",
      "isDefinedOnField": true,
      "fields": [
        {
          "name": "id"
        }
      ]
    }
  ]
};
